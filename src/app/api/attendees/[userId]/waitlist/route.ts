import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socket";
import { Resend } from "resend";
import { nanoid } from "nanoid"; // ✅ 自动生成唯一票号
// import { render } from '@react-email/render';
// import PurchaseConfirmationEmail from '@/emails/PurchaseConfirmationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

/* ─────────────── GET: 查询已购票 ─────────────── */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: raw } = await params;
  const userId = Number(raw);

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  // 拉取所有已waitlisted的票，并把 ticketType.event 一并 include
  const waitlists = await prisma.waitlistedTicket.findMany({
    where: {
      userId,
    },
    include: {
      ticket: {
        include: {
          ticketType: {
            include: {
              event: true, // 把活动信息也拉进来
              tickets: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // construct front end需要的字段列表
  const data = waitlists.map((p, index) => ({
    waitlistId: p.id,
    waitlistAt: p.createdAt.toISOString(),
    eventId: p.ticket.ticketType.event.id,
    eventName: p.ticket.ticketType.event.name,
    ticketTypeId: p.ticket.ticketType.id,
    ticketTypeName: p.ticket.ticketType.name,
    price: p.ticket.ticketType.price,
    purchased: p.purchased,
    ticketId: p.ticket.id,
    waitlistRank:
      p.ticket.ticketType.tickets
        .filter((x) => !x.purchased && x.waitlisted)
        .findIndex((w) => w.id === p.ticket.id) + 1,
  }));

  return NextResponse.json({ data });
}

/* ─────────────── POST: waitlist ticket ─────────────── */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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
      { status: 400 }
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
        { status: 400 }
      );
    }

    appliedPromotion = {
      id: promo.id,
      code: promo.code,
      type: promo.type,
      amount: promo.amount,
    };

    await prisma.promoCode.update({
      where: { id: promo.id },
      data: { usageCount: { increment: 1 } },
    });
  }

  /* ───── 分配未售出 Waitlisted Ticket ───── */
  try {
    const ticket = await prisma.ticket.create({
      data: {
        ticketTypeId: ticketTypeId,
        purchased: false,
        checkedIn: false,
        code: `TICKET-${nanoid(8)}`, // 生成唯一标识码
      },
    });

    // 更新票票据并同时创建等候票记录
    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        waitlisted: true,
        waitlistedTicket: {
          create: { userId },
        },
      },
      include: {
        ticketType: {
          include: {
            event: true,
          },
        },
        waitlistedTicket: {
          include: {
            user: true,
          },
        },
      },
    });

    try {
      const io = getIO?.();
      io?.emit("ticketWaitlisted", {
        ticketTypeId: updated.ticketType.id,
        ticketId: updated.id,
      });
    } catch {}

    const allWaitlistedTickets = await prisma.ticket.findMany({
      where: { ticketTypeId: updated.ticketType.id, waitlisted: true },
    });

    const newlyAddedWaitlistTicket = await prisma.waitlistedTicket.findFirst({
      where: {
        ticketId: ticket.id, // 就是刚刚分配的那张票
        userId, // 是这个用户的
      },
    });

    // 构造响应数据
    const responseData = {
      message: "Waitlist successful",
      waitlistRank: allWaitlistedTickets.length,
      waitlistId: newlyAddedWaitlistTicket!.id,
    };

    /* ───── Email Confirmation ───── */
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.email) {
      try {
        // const html = render(
        //   React.createElement(PurchaseConfirmationEmail, {
        //     userName: user.name || "Attendee",
        //     eventName: ticketType.event.name,
        //     startDate: ticketType.event.startDate,
        //     endDate: ticketType.event.endDate,
        //     ticketType: ticketType.name,
        //     price: ticketType.price,
        //   })
        // );
        console.log("Sending email with:", {
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: `🎟️ Waitlist for ${ticketType.event.name}`,
        });
        const data = await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: `🎟️ Waitlist for ${ticketType.event.name}`,
          html: `
          <p>Hi ${user.name || "Attendee"},</p>
          <p>Thank you for joining the waitlist for <strong>${ticketType.event.name}</strong>!</p>
          <p><strong>Event Time:</strong> ${new Date(ticketType.event.startDate).toLocaleString()} – ${new Date(ticketType.event.endDate).toLocaleString()}</p>
          <p><strong>Ticket Type:</strong> ${ticketType.name}</p>
          <p><strong>Waitlist Rank:</strong> ${allWaitlistedTickets.length}</p>
          <p>We will notify you as soon as a ticket becomes available. Stay tuned!</p>
        `,
        });
      } catch (error) {
        console.error("Email failed to send:", error);
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to create waitlisted ticket:", error);
    return NextResponse.json(
      { error: "Failed to create waitlisted ticket" },
      { status: 500 }
    );
  }
}
