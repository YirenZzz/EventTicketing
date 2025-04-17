import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }   // 👈 Promise
) {
  const { userId: rawUserId } = await params;            // 👈 await 先解包
  const userId = Number(rawUserId);

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  // 1) 取所有非取消事件，连票类型与票
  const events = await prisma.event.findMany({
    where: { status: { not: 'CANCELLED' } },
    include: {
      ticketTypes: {
        include: { tickets: { select: { purchased: true } } },
      },
    },
  });

  // 2) 取用户已购票对应的 eventId
  const purchased = await prisma.purchasedTicket.findMany({
    where: { userId },
    select: {
      ticket: { select: { ticketType: { select: { eventId: true } } } },
    },
  });
  const registeredEventIds = new Set(
    purchased.map(p => p.ticket.ticketType.eventId),
  );

  // 3) 构造响应
  const data = events.map(ev => {
    const allTickets        = ev.ticketTypes.flatMap(t => t.tickets);
    const hasAvailable      = allTickets.some(t => !t.purchased);
    const minPrice          = ev.ticketTypes.length
      ? Math.min(...ev.ticketTypes.map(t => t.price))
      : 0;

    return {
      id: ev.id,
      name: ev.name,
      startDate: ev.startDate,
      location: ev.location ?? 'TBA',
      isRegistered: registeredEventIds.has(ev.id),
      hasAvailableTickets: hasAvailable,
      minTicketPrice: minPrice,
    };
  });

  return NextResponse.json({ data });
}