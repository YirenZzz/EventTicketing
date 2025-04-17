import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
  ) {
    const { userId: rawUserId } = await params;
    const userId = Number(rawUserId);
  
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
  
    // 1) 拉取所有非取消的事件，包含 coverImage 和票种
    const events = await prisma.event.findMany({
      where: { status: { not: 'CANCELLED' } },
      include: {
        ticketTypes: {
          include: {
            tickets: {
              select: { purchased: true }
            }
          }
        }
      },
    });
  
    // 2) 查出当前 user 参与的所有 eventId
    const purchased = await prisma.purchasedTicket.findMany({
      where: { userId },
      select: {
        ticket: {
          select: {
            ticketType: {
              select: {
                eventId: true
              }
            }
          }
        }
      },
    });
  
    const registeredEventIds = new Set(
      purchased.map(p => p.ticket.ticketType.eventId)
    );
  
    // 3) 构造响应结构，加入 coverImage 字段
    const data = events.map(ev => {
      const allTickets = ev.ticketTypes.flatMap(t => t.tickets);
      const hasAvailable = allTickets.some(t => !t.purchased);
      const minPrice = ev.ticketTypes.length
        ? Math.min(...ev.ticketTypes.map(t => t.price))
        : 0;
  
      return {
        id: ev.id,
        name: ev.name,
        startDate: ev.startDate,
        location: ev.location ?? 'TBA',
        coverImage: ev.coverImage ?? null,                      // ✅ 新增字段
        isRegistered: registeredEventIds.has(ev.id),
        hasAvailableTickets: hasAvailable,
        minTicketPrice: minPrice,
      };
    });
  
    return NextResponse.json({ data });
  }