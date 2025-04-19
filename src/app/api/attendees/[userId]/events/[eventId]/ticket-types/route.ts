import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/attendees/[userId]/events/[eventId]/ticket-types
 * 返回:
 *  {
 *    event: { id, name, startDate, endDate, location, description },
 *    ticketTypes: [{ id, name, price, total, available }]
 *  }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; eventId: string }> }
) {
  const { userId: rawUserId, eventId: rawEventId } = await params;
  const userId  = Number(rawUserId);
  const eventId = Number(rawEventId);

  if (isNaN(userId) || isNaN(eventId)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  // 可选：验证 attendee 是否存在
  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      location: true,
      description: true,
    },
  });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const types = await prisma.ticketType.findMany({
    where: { eventId },
    include: { tickets: { select: { purchased: true } } },
  });

  const ticketTypes = types.map(t => ({
    id: t.id,
    name: t.name,
    price: t.price,
    total: t.tickets.length,
    available: t.tickets.filter(x => !x.purchased).length,
  }));

  return NextResponse.json({ event, ticketTypes });
}