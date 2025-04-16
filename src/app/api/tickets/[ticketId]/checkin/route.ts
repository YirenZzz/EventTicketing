// import { db } from "@/lib/db";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(
//   req: NextRequest,
//   { params }: { params: { ticketId: string } },
// ) {
//   const ticketId = Number(params.ticketId);
//   if (isNaN(ticketId)) {
//     return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
//   }

//   try {
//     const ticket = await db.ticket.update({
//       where: { id: ticketId },
//       data: {
//         status: "CheckedIn",
//         checkinAt: new Date(),
//       },
//     });

//     return NextResponse.json({ message: "Check-in successful", ticket });
//   } catch (err) {
//     console.error("Check-in error:", err);
//     return NextResponse.json({ error: "Failed to check in" }, { status: 500 });
//   }
// }

// import { db } from "@/lib/db";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { ticketId: string } },
// ) {
//   const ticket = await db.ticket.findUnique({
//     where: { id: Number(params.ticketId) },
//   });

//   if (!ticket) {
//     return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
//   }

//   return NextResponse.json({ ticket });
// }

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

    return NextResponse.json({ message: "✅ Ticket checked in successfully!" });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
