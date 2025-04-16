import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { promoId: string } }
) {
  const promoId = parseInt(params.promoId);
  const body = await req.json();

  try {
    const updated = await prisma.promoCode.update({
      where: { id: promoId },
      data: {
        code: body.code,
        type: body.type,
        amount: parseFloat(body.amount),
        ticketTypeId: body.ticketTypeId ? parseInt(body.ticketTypeId) : undefined,
        maxUsage: body.maxUsage ? parseInt(body.maxUsage) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { promoId: string } }
) {
  const promoId = parseInt(params.promoId);
  try {
    await prisma.promoCode.delete({ where: { id: promoId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 });
  }
}