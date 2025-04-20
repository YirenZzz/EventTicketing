// src/app/api/organizers/[userId]/events/[eventId]/purchased-tickets/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string; eventId: string }> }
) {
  // await params 之后才能使用其中的属性
  const { eventId } = await context.params;
  const eventIdNum = Number(eventId);

  if (isNaN(eventIdNum)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  try {
    const purchasedTickets = await prisma.purchasedTicket.findMany({
      where: {
        ticket: {
          ticketType: {
            eventId: eventIdNum,
          },
        },
      },
      select: {
        id: true,
        finalPrice: true,
      },
    });

    return NextResponse.json({ purchasedTickets });
  } catch (error) {
    console.error("Failed to fetch purchased tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchased tickets" },
      { status: 500 }
    );
  }
}