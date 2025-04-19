// src/app/api/events/[id]/tickets/[ticketId]/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Update ticketTypes
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; ticketId: string } },
) {
  const ticketId = Number(params.ticketId);
  if (isNaN(ticketId)) {
    return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
  }

  const body = await req.json();
  const { name, price, quantity } = body;

  try {
    const updated = await db.ticket.update({
      where: { id: ticketId },
      data: { name, price, quantity },
    });

    return NextResponse.json({ ticket: updated });
  } catch (error) {
    console.error("Failed to update ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 },
    );
  }
}

// Delete
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; ticketId: string } },
) {
  const ticketId = Number(params.ticketId);
  if (isNaN(ticketId)) {
    return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
  }

  try {
    await db.ticket.delete({ where: { id: ticketId } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Failed to delete ticket:", error);
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 },
    );
  }
}
