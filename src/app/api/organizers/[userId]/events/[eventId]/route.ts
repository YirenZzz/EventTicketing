// src/app/api/organizers/[userId]/events/[eventId]/route.ts
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/* ─────────────── GET ─────────────── */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string; eventId: string }> }
) {
  const { eventId } = await params;                     // ✅ await
  const id = Number(eventId);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });

  const event = await db.event.findUnique({
    where: { id },
    include: { organizer: true },
  });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  return NextResponse.json({
    event: {
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      organizerName: event.organizer?.name ?? 'Unknown',
    },
  });
}

/* ─────────────── PATCH ─────────────── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; eventId: string }> }
) {
  const { eventId } = await params;                     
  const id = Number(eventId);
  const { name, description, startDate, endDate, status } = await req.json();

  try {
    const updated = await db.event.update({
      where: { id },
      data: {
        name,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
      },
    });
    return NextResponse.json({ event: updated });
  } catch (e) {
    console.error('Failed to update event:', e);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

/* ─────────────── DELETE ─────────────── */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string; eventId: string }> }
) {
  const { userId, eventId } = await params;          
  const uid = Number(userId);
  const eid = Number(eventId);

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'Organizer' || Number(session.user.id) !== uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    /* ……原有删除逻辑保持不变，使用 eid …… */
    // 1) 找 ticketTypeIds
    const ticketTypeIds = (await db.ticketType.findMany({
      where: { eventId: eid },
      select: { id: true },
    })).map(tt => tt.id);

    if (ticketTypeIds.length) {
      const ticketIds = (await db.ticket.findMany({
        where: { ticketTypeId: { in: ticketTypeIds } },
        select: { id: true },
      })).map(t => t.id);

      await db.checkIn.deleteMany({ where: { ticketId: { in: ticketIds } } });
      await db.purchasedTicket.deleteMany({ where: { ticketId: { in: ticketIds } } });
      await db.ticket.deleteMany({ where: { ticketTypeId: { in: ticketTypeIds } } });
      await db.ticketType.deleteMany({ where: { id: { in: ticketTypeIds } } });
    }
    await db.event.delete({ where: { id: eid } });
    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (e) {
    console.error('Failed to delete event:', e);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
