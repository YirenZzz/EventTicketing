import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  const eventId = Number(params.id);
  if (isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  const tickets = await db.ticket.findMany({
    where: { eventId },
    orderBy: { id: "asc" },
  });

  return NextResponse.json({ tickets });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const eventId = Number(params.id);
  if (isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  const { name, price, quantity } = await req.json();

  if (!name || price == null || quantity == null) {
    return NextResponse.json(
      { error: "Missing required fields: name, price, quantity" },
      { status: 400 },
    );
  }

  try {
    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const ticket = await db.ticket.create({
      data: {
        name,
        price,
        quantity,
        eventId,
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 },
    );
  }
}
