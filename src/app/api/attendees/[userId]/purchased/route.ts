import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socket";

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

  // 拉取所有已购买的票，并把 ticketType.event 一并 include
  const purchases = await prisma.purchasedTicket.findMany({
    where: {
      userId,
    },
    include: {
      ticket: {
        include: {
          ticketType: {
            include: {
              event: true, // 把活动信息也拉进来
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // construct front end需要的字段列表
  const data = purchases.map((p) => ({
    purchaseId: p.id,
    purchasedAt: p.createdAt.toISOString(),
    eventId: p.ticket.ticketType.event.id,
    eventName: p.ticket.ticketType.event.name,
    eventStart: p.ticket.ticketType.event.startDate.toISOString(), // 新增
    eventEnd: p.ticket.ticketType.event.endDate.toISOString(), // 新增
    ticketTypeId: p.ticket.ticketType.id,
    ticketTypeName: p.ticket.ticketType.name,
    price: p.ticket.ticketType.price,
    checkedIn: p.checkedIn,
    ticketId: p.ticket.id,
    code: p.ticket.code,
  }));

  return NextResponse.json({ data });
}

/* ─────────────── POST: 用户购票 ─────────────── */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId: raw } = await params;
  const userId = Number(raw);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const { ticketTypeId, promoCode } = await req.json();

  if (!ticketTypeId) {
    return NextResponse.json(
      { error: "Missing ticketTypeId" },
      { status: 400 },
    );
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
        { status: 400 },
      );
    }

    // 应用优惠信息
    appliedPromotion = {
      id: promo.id,
      code: promo.code,
      type: promo.type,
      amount: promo.amount,
    };

    // 使用次数减少
    await prisma.promoCode.update({
      where: { id: promo.id },
      data: {
        usageCount: { increment: 1 },
      },
    });
  }

  /* ───── 分配未售出 Ticket ───── */
  const ticket = await prisma.ticket.findFirst({
    where: {
      ticketTypeId,
      purchased: false,
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "No available ticket" }, { status: 400 });
  }

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      purchased: true,
      purchasedTicket: {
        create: {
          userId,
        },
      },
    },
    include: {
      ticketType: {
        select: {
          id: true,
          tickets: {
            where: { purchased: false },
          },
        },
      },
      purchasedTicket: true,
    },
  });

  const remaining = updated.ticketType.tickets.length;

  const purchase = await prisma.purchasedTicket.findFirst({
    where: {
      ticketId: ticket.id, // 就是刚刚分配的那张票
      userId, // 是这个用户的
    },
  });

  /* ───── Socket 广播（可选）───── */
  try {
    const io = getIO?.();
    io?.emit("ticketPurchased", {
      ticketTypeId: updated.ticketType.id,
      ticketId: updated.id,
    });
  } catch {}

  return NextResponse.json({
    message: "Purchase successful",
    remaining,
    promo: appliedPromotion,
    // purchaseId: updated.purchasedTicket?.[0]?.id,
    purchaseId: purchase?.id,
  });
}
