import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { ticketId: string } }) {
  const ticketId = Number(params.ticketId);
  if (isNaN(ticketId)) return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });

  try {
    const checkin = await db.checkIn.create({
      data: { ticketId },
    });

    return NextResponse.json({ checkin });
  } catch (err) {
    console.error('Check-in error:', err);
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
  }
}