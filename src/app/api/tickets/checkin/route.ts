// // ✅ app/api/tickets/checkin/route.ts
// import { db } from "@/lib/db";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { ticketCode } = await req.json();

//     if (!ticketCode) {
//       return NextResponse.json(
//         { error: "Ticket code missing" },
//         { status: 400 },
//       );
//     }

//     const ticket = await db.ticket.findUnique({
//       where: { code: ticketCode },
//     });

//     if (!ticket) {
//       return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
//     }

//     if (ticket.status === "CheckedIn") {
//       return NextResponse.json(
//         { error: "Ticket already checked in" },
//         { status: 400 },
//       );
//     }

//     const updated = await db.ticket.update({
//       where: { id: ticket.id },
//       data: {
//         status: "CheckedIn",
//         checkinAt: new Date(),
//       },
//     });

//     return NextResponse.json({
//       message: "Check-in successful",
//       ticket: updated,
//     });
//   } catch (err) {
//     console.error("Check-in failed:", err);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }

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

    // 如果已 check-in 就不重复
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

    return NextResponse.json({ message: "Check-in successful" }); // ✅ 正确返回 JSON
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 }); // ✅ 错误也返回 JSON
  }
}
