import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { ticketTypeId: string } }
) {
  const ticketTypeId = Number(params.ticketTypeId);
  if (isNaN(ticketTypeId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const ticketType = await db.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        event: true,
        tickets: {
          include: {
            purchasedTicket: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!ticketType) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ ticketType });
  } catch (error) {
    console.error('Error fetching ticket type:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}