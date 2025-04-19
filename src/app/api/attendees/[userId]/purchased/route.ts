import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socket";
import { Resend } from 'resend';
import QRCode from 'qrcode';

const resend = new Resend(process.env.RESEND_API_KEY);

/* ─────────────── GET: 查询已购票 ─────────────── */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId: raw } = await params;
  const userId = Number(raw);

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const purchases = await prisma.purchasedTicket.findMany({
    where: { userId },
    include: {
      ticket: {
        include: {
          ticketType: {
            include: { event: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = purchases.map((p) => ({
    purchaseId: p.id,
    purchasedAt: p.createdAt.toISOString(),
    eventId: p.ticket.ticketType.event.id,
    eventName: p.ticket.ticketType.event.name,
    eventStart: p.ticket.ticketType.event.startDate.toISOString(),
    eventEnd: p.ticket.ticketType.event.endDate.toISOString(),
    ticketTypeId: p.ticket.ticketType.id,
    ticketTypeName: p.ticket.ticketType.name,
    price: p.ticket.ticketType.price,
    checkedIn: p.checkedIn,
    ticketId: p.ticket.id,
    code: p.ticket.code,
  }));

  return NextResponse.json({ data });
}

/* ─────────────── POST: 用户购票或前端试算 ─────────────── */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: raw } = await params;
  const userId = Number(raw);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const { ticketTypeId, promoCode, dryRun } = await req.json();

  if (!ticketTypeId) {
    return NextResponse.json({ error: "Missing ticketTypeId" }, { status: 400 });
  }

  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: { event: true },
  });

  if (!ticketType) {
    return NextResponse.json({ error: "Invalid ticket type" }, { status: 400 });
  }

  /* ───── Validate Promo Code ───── */
  let appliedPromotion = null;
  let finalPrice = ticketType.price;

  if (promoCode) {
    const now = new Date();

    const promo = await prisma.promoCode.findFirst({
      where: {
        code: promoCode,
        OR: [
          { ticketTypeId: ticketType.id },
          { ticketTypeId: null, eventId: ticketType.eventId },
        ],
        startDate: { lte: now },
        endDate: { gte: now },
        maxUsage: { gt: 0 },
      },
    });

    if (!promo) {
      return NextResponse.json(
        { error: "Invalid or expired promo code" },
        { status: 400 }
      );
    }

    appliedPromotion = {
      id: promo.id,
      code: promo.code,
      type: promo.type,
      amount: promo.amount,
    };

    finalPrice = promo.type === "percentage"
      ? +(ticketType.price * (1 - promo.amount / 100)).toFixed(2)
      : Math.max(0, +(ticketType.price - promo.amount).toFixed(2));

    if (!dryRun) {
      await prisma.promoCode.update({
        where: { id: promo.id },
        data: { usageCount: { increment: 1 } },
      });
    }
  }

  /* ───── Dry Run 只返回折扣，不购票 ───── */
  if (dryRun) {
    return NextResponse.json({
      message: "Promo validated",
      promo: appliedPromotion,
      finalPrice,
    });
  }

  /* ───── 分配未售出 Ticket ───── */
  const ticket = await prisma.ticket.findFirst({
    where: { ticketTypeId, purchased: false },
  });

  if (!ticket) {
    return NextResponse.json({ error: "No available ticket" }, { status: 400 });
  }

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      purchased: true,
      purchasedTicket: {
        create: { userId },
      },
    },
    include: {
      ticketType: {
        select: {
          id: true,
          tickets: { where: { purchased: false } },
        },
      },
      purchasedTicket: true,
    },
  });

  const remaining = updated.ticketType.tickets.length;

  const purchase = await prisma.purchasedTicket.findFirst({
    where: {
      ticketId: ticket.id,
      userId,
    },
  });

  /* ───── Socket ───── */
  try {
    const io = getIO?.();
    io?.emit("ticketPurchased", {
      ticketTypeId: updated.ticketType.id,
      ticketId: updated.id,
    });
  } catch {}

  /* ───── Email Confirmation ───── */
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user?.email) {
    try {
      const qrDataUrl = await QRCode.toDataURL(ticket.code);
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: `🎟️ Your ticket for ${ticketType.event.name}`,
        html: `
          <p>Hi ${user.name || 'Attendee'},</p>
          <p>Thank you for purchasing a ticket for <strong>${ticketType.event.name}</strong>!</p>
          <p><strong>Event Time:</strong> ${new Date(ticketType.event.startDate).toLocaleString()} – ${new Date(ticketType.event.endDate).toLocaleString()}</p>
          <p><strong>Ticket Type:</strong> ${ticketType.name}</p>
          <p><strong>Ticket Code:</strong> ${ticket.code}</p>
          <p><strong>QR Code:</strong><br />
          <img src="${qrDataUrl}" alt="QR Code" width="200" height="200" />
          </p>
          <p>Please bring this code to check in. See you there!</p>
        `,
      });
    } catch (error) {
      console.error("Email failed to send:", error);
    }
  }

  return NextResponse.json({
    message: "Purchase successful",
    remaining,
    promo: appliedPromotion,
    finalPrice,
    purchaseId: purchase?.id,
  });
}