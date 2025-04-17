import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getIO } from '@/lib/socket'; // 如果你有 socket 广播功能

/* ─────────────── GET: 查询已购票 ─────────────── */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: raw } = await params;
  const userId = Number(raw);

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  const tickets = await prisma.purchasedTicket.findMany({
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
    orderBy: { createdAt: 'desc' },
  });

  const data = tickets.map(p => ({
    purchaseId:     p.id,
    purchasedAt:    p.createdAt,
    eventId:        p.ticket.ticketType.event.id,
    eventName:      p.ticket.ticketType.event.name,
    ticketTypeId:   p.ticket.ticketType.id,             // ✅ 关键字段：前端判断是否已购票
    ticketTypeName: p.ticket.ticketType.name,
    price:          p.ticket.ticketType.price,
    checkedIn:      p.checkedIn,
    ticketId:       p.ticket.id,
  }));

  return NextResponse.json({ data });
}

/* ─────────────── POST: 用户购票 ─────────────── */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: raw } = await params;
  const userId = Number(raw);

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  const { ticketTypeId } = await req.json();

  if (!ticketTypeId) {
    return NextResponse.json({ error: 'Missing ticketTypeId' }, { status: 400 });
  }

  // 查找可用 ticket
  const ticket = await prisma.ticket.findFirst({
    where: {
      ticketTypeId,
      purchased: false,
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: 'No available ticket' }, { status: 400 });
  }

  // 创建 PurchasedTicket，并标记 ticket 为已售出
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
    },
  });

  // 剩余数量
  const remaining = updated.ticketType.tickets.length;

  // Socket 广播（可选）
  try {
    const io = getIO?.();
    io?.emit('ticketPurchased', {
      ticketTypeId: updated.ticketType.id,
      ticketId: updated.id,
    });
  } catch {}

  return NextResponse.json({
    message: 'Purchase successful',
    remaining,
  });
}