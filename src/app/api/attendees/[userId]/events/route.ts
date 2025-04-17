import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = Number(params.userId);
  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  // 获取所有非取消的 Event，带上 ticketTypes 和 tickets
  const events = await prisma.event.findMany({
    where: {
      status: { not: 'CANCELLED' },
    },
    include: {
      ticketTypes: {
        include: {
          tickets: {
            select: {
              id: true,
              purchased: true,
              ticketTypeId: true,
            },
          },
        },
      },
    },
  });

  // 获取当前用户购买的所有 tickets（用于判断是否已注册）
  const purchased = await prisma.purchasedTicket.findMany({
    where: { userId },
    select: {
      ticket: {
        select: {
          ticketType: {
            select: {
              eventId: true,
            },
          },
        },
      },
    },
  });

  const registeredEventIds = new Set(
    purchased.map((p) => p.ticket.ticketType.eventId)
  );

  // 构造响应数据
  const result = events.map((event) => {
    const allTickets = event.ticketTypes.flatMap((type) => type.tickets);
    const hasAvailableTickets = allTickets.some((t) => !t.purchased);
    const allPrices = event.ticketTypes.map((t) => t.price);
    const minTicketPrice =
      allPrices.length > 0 ? Math.min(...allPrices) : 0;

    return {
      id: event.id,
      name: event.name,
      startDate: event.startDate,
      location: event.location || 'TBA',
      isRegistered: registeredEventIds.has(event.id),
      hasAvailableTickets,
      minTicketPrice,
    };
  });

  return NextResponse.json({ data: result });
}