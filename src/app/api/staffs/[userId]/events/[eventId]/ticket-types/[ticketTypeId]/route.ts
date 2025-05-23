// src/app/api/organizers/[userId]/events/[eventId]/ticket-types/[ticketTypeId]/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/* ─────────────────────── GET ─────────────────────── */
export async function GET(
  _: NextRequest,
  context: { params: Promise<{ ticketTypeId: string }> },
) {
  const { ticketTypeId } = await context.params;
  const id = Number(ticketTypeId);
  if (isNaN(id))
    return NextResponse.json(
      { error: "Invalid ticket type ID" },
      { status: 400 },
    );

  try {
    const ticketType = await db.ticketType.findUnique({
      where: { id },
      include: {
        event: { select: { name: true } },
        tickets: {
          include: {
            purchasedTicket: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });
    if (!ticketType)
      return NextResponse.json(
        { error: "Ticket type not found" },
        { status: 404 },
      );
    return NextResponse.json({ ticketType });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch ticket type" },
      { status: 500 },
    );
  }
}

/* ─────────────────────── DELETE ─────────────────────── */
export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ ticketTypeId: string }> },
) {
  const { ticketTypeId } = await context.params;
  const id = Number(ticketTypeId);
  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const sold = await db.ticket.count({
      where: { ticketTypeId: id, purchased: true },
    });
    if (sold > 0) {
      return NextResponse.json(
        { error: "Cannot delete ticket type that has already sold tickets." },
        { status: 400 },
      );
    }

    await db.ticket.deleteMany({ where: { ticketTypeId: id } });
    await db.ticketType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

/* ─────────────────────── PATCH ─────────────────────── */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ eventId: string; ticketTypeId: string }> },
) {
  const { eventId, ticketTypeId } = await context.params;
  const id = Number(ticketTypeId);
  const eventIdNum = Number(eventId);
  if (isNaN(id) || isNaN(eventIdNum)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const { name, price, quantity } = await req.json();

  try {
    // 禁止编辑已售票的票种
    const sold = await db.ticket.count({
      where: { ticketTypeId: id, purchased: true },
    });
    if (sold > 0) {
      return NextResponse.json(
        { error: "Cannot edit ticket type that has already sold tickets." },
        { status: 400 },
      );
    }

    const duplicate = await db.ticketType.findFirst({
      where: { eventId: eventIdNum, name: name.trim(), NOT: { id } },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Ticket type name already exists." },
        { status: 400 },
      );
    }

    const updated = await db.ticketType.update({
      where: { id },
      data: { name: name.trim(), price, quantity },
    });
    return NextResponse.json({ ticketType: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
