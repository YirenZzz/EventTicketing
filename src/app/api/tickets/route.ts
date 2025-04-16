// app/api/tickets/route.ts
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, price, quantity, eventId } = body;

  if (!name || !price || !quantity || !eventId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const event = await db.event.findUnique({ where: { id: Number(eventId) } });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const ticket = await db.ticket.create({
    data: {
      name,
      price,
      quantity,
      eventId: Number(eventId),
    },
  });

  return NextResponse.json({ ticket });
}