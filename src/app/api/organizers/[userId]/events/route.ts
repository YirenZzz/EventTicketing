import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q');
  const page = Number(searchParams.get('page') || 1);
  const pageSize = 10;

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          name: {
            contains: q,
            mode: 'insensitive',
          },
        }
      : {}),
  };

  const events = await db.event.findMany({
    where,
    orderBy: { startDate: 'asc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const total = await db.event.count({ where });

  return NextResponse.json({
    data: events,
    meta: {
      page,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'Organizer') {
    return NextResponse.json({ error: 'Only organizers can create events' }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, startDate, endDate } = body;

  try {
    const event = await db.event.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'UPCOMING',
        organizer: { connect: { id: Number(session.user.id) } },
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'Organizer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('id');
    if (!eventId) {
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }
  
    try {
      const event = await db.event.findUnique({
        where: { id: Number(eventId) },
        select: { organizerId: true },
      });
  
      if (!event || event.organizerId !== Number(session.user.id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
  
      await db.event.delete({ where: { id: Number(eventId) } });
  
      return NextResponse.json({ message: 'Event deleted' });
    } catch (error) {
      console.error('Delete event error:', error);
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
  }