import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { ticketCode } = await req.json();
    if (!ticketCode) {
      return NextResponse.json(
        { error: "Missing ticket code" },
        { status: 400 },
      );
    }

    const ticket = await db.ticket.findUnique({
      where: { code: ticketCode },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.checkedIn) {
      return NextResponse.json(
        { error: "Ticket already checked in" },
        { status: 400 },
      );
    }

    const updated = await db.ticket.update({
      where: { code: ticketCode },
      data: { checkedIn: true },
    });

    return NextResponse.json({ message: "Check-in successful" });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
