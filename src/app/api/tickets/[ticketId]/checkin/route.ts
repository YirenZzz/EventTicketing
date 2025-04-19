// /src/app/api/tickets/[ticketId]/checkin/route.ts

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { ticketId: string } },
) {
  try {
    const ticketId = Number(params.ticketId);

    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.checkedIn) {
      return NextResponse.json(
        { error: "Already checked in" },
        { status: 400 },
      );
    }

    await db.ticket.update({
      where: { id: ticketId },
      data: { checkedIn: true },
    });

    const purchase = await db.purchasedTicket.findFirst({
      where: { ticketId },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase record not found" },
        { status: 404 },
      );
    }

    await db.purchasedTicket.update({
      where: { id: purchase.id },
      data: { checkedIn: true },
    });

    return NextResponse.json({ message: "✅ Ticket checked in successfully!" });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
