// src/app/api/organizers/[userId]/events/[eventId]/ticket-types/route.ts

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid"; // ✅ 自动生成唯一票号

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ userId: string; eventId: string }> },
) {
  const { eventId } = await context.params;
  const eventIdNum = Number(eventId);

  if (isNaN(eventIdNum)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  try {
    const ticketTypes = await db.ticketType.findMany({
      where: { eventId: eventIdNum },
      include: { tickets: true },
    });

    return NextResponse.json({ ticketTypes });
  } catch (error) {
    console.error("Failed to fetch ticket types:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket types" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string; eventId: string }> },
) {
  const { eventId } = await context.params;
  const eventIdNum = Number(eventId);
  const body = await req.json();
  const { name, price, quantity, code } = body;

  if (isNaN(eventIdNum)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  try {
    const ticketType = await db.ticketType.create({
      data: {
        name,
        price,
        quantity,
        eventId: eventIdNum,
        tickets: {
          createMany: {
            data: Array.from({ length: quantity }, () => ({
              purchased: false,
              checkedIn: false,
              code: `TICKET-${nanoid(8)}`,
            })),
          },
        },
      },
      include: { tickets: true },
    });

    return NextResponse.json({ ticketType });
  } catch (error) {
    console.error("Failed to create ticket type:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
