import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { userId: string; eventId: string } },
) {
  const params = await Promise.resolve(context.params);
  const userIdNum = parseInt(params.userId);
  const eventIdNum = parseInt(params.eventId);

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventIdNum },
      select: { organizerId: true },
    });

    if (!event || event.organizerId !== userIdNum) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const promos = await prisma.promoCode.findMany({
      where: { eventId: eventIdNum },
      include: {
        ticketType: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(promos);
  } catch (error) {
    console.error("Error fetching promos:", error);
    return NextResponse.json(
      { error: "Failed to fetch promos" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { userId: string; eventId: string } },
) {
  const params = await Promise.resolve(context.params);
  const userIdNum = parseInt(params.userId);
  const eventIdNum = parseInt(params.eventId);
  const body = await req.json();

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventIdNum },
      select: { organizerId: true },
    });

    if (!event || event.organizerId !== userIdNum) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const newPromo = await prisma.promoCode.create({
      data: {
        code: body.code,
        type: body.type,
        amount: parseFloat(body.amount),
        maxUsage: body.maxUsage ? parseInt(body.maxUsage) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        eventId: eventIdNum,
        ticketTypeId: body.ticketTypeId
          ? parseInt(body.ticketTypeId)
          : undefined,
      },
    });

    return NextResponse.json(newPromo);
  } catch (error) {
    console.error("Error creating promo code:", error);
    return NextResponse.json(
      { error: "Failed to create promo" },
      { status: 500 },
    );
  }
}
