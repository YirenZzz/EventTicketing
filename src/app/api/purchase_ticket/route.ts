// app/api/purchase_ticket/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ticketTypeId, userEmail } = body;

    if (!userId || !ticketTypeId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 创建购买记录（示例）
    const purchased = await db.purchasedTicket.create({
      data: {
        userId,
        ticketTypeId,
      },
      include: {
        ticketType: {
          include: {
            event: true,
          },
        },
      },
    });

    const ticketCode = purchased.id.toString().padStart(8, '0');
    const eventName = purchased.ticketType.event.name;

    // 调用邮件 API
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: userEmail,
        eventName,
        ticketCode,
      }),
    });

    return NextResponse.json({ success: true, purchased });
  } catch (error) {
    console.error('Error purchasing ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}