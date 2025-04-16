// src/app/api/organizers/[userId]/events/[eventId]/ticket-types/[ticketTypeId]/route.ts

import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// ✅ 获取单个票种（含其所有 ticket 详情）
export async function GET(
  _: NextRequest,
  context: { params: Promise<{ userId: string; eventId: string; ticketTypeId: string }> }
) {
  const { ticketTypeId } = await context.params;
  const id = Number(ticketTypeId);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ticket type ID' }, { status: 400 });
  }

  try {
    const ticketType = await db.ticketType.findUnique({
      where: { id },
      include: {
        event: { select: { name: true } },
        tickets: {
          include: {
            purchasedTicket: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!ticketType) {
      return NextResponse.json({ error: 'Ticket type not found' }, { status: 404 });
    }

    return NextResponse.json({ ticketType });
  } catch (error) {
    console.error('Failed to fetch ticket type:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket type' }, { status: 500 });
  }
}
// ✅ 删除票种及其 tickets
export async function DELETE(
  req: NextRequest,
  context: { params: { eventId: string; ticketTypeId: string } }
) {
  const { ticketTypeId } = context.params;
  const id = Number(ticketTypeId);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    await db.ticket.deleteMany({ where: { ticketTypeId: id } });
    await db.ticketType.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete ticket type', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

// ✅ 更新票种基本信息
export async function PATCH(
  req: NextRequest,
  context: { params: { eventId: string; ticketTypeId: string } }
) {
  const { ticketTypeId } = context.params;
  const id = Number(ticketTypeId);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const body = await req.json();
  const { name, price, quantity } = body;

  try {
    const updated = await db.ticketType.update({
      where: { id },
      data: { name, price, quantity },
    });

    return NextResponse.json({ ticketType: updated });
  } catch (error) {
    console.error('Failed to update ticket type', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}