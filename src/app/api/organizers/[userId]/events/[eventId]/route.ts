// src/app/api/organizers/[userId]/events/[eventId]/route.ts
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: { userId: string; eventId: string } }
) {
  const eventId = Number(params.eventId);
  if (isNaN(eventId)) {
    return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: { organizer: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json({
    event: {
      id: event.id,
      name: event.name,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      organizerName: event.organizer?.name || 'Unknown',
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string; eventId: string } }
) {
  const eventId = Number(params.eventId);
  const { name, description, startDate, endDate, status } = await req.json();

  try {
    const updated = await db.event.update({
      where: { id: eventId },
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
      },
    });

    return NextResponse.json({ event: updated });
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { userId: string; eventId: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = Number(params.userId);
  const eventId = Number(params.eventId);

  if (
    !session?.user ||
    session.user.role !== 'Organizer' ||
    Number(session.user.id) !== userId
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // 找出所有 ticketType.id 属于这个 event 的
    const ticketTypeIds = (
      await db.ticketType.findMany({
        where: { eventId },
        select: { id: true },
      })
    ).map((tt) => tt.id);

    if (ticketTypeIds.length > 0) {
      const ticketIds = (
        await db.ticket.findMany({
          where: { ticketTypeId: { in: ticketTypeIds } },
          select: { id: true },
        })
      ).map((t) => t.id);

      // Step 1: 删除所有 CheckIn（依赖 ticketId）
      await db.checkIn.deleteMany({
        where: { ticketId: { in: ticketIds } },
      });

      // Step 2: 删除所有 PurchasedTicket（依赖 ticketId）
      await db.purchasedTicket.deleteMany({
        where: { ticketId: { in: ticketIds } },
      });

      // Step 3: 删除所有 Ticket（依赖 ticketTypeId）
      await db.ticket.deleteMany({
        where: { ticketTypeId: { in: ticketTypeIds } },
      });

      // Step 4: 删除所有 TicketType（依赖 eventId）
      await db.ticketType.deleteMany({
        where: { id: { in: ticketTypeIds } },
      });
    }

    // Step 5: 删除 Event 本身
    await db.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}