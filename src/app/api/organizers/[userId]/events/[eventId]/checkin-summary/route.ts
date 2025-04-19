import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string; eventId: string }> },
) {
  const { userId, eventId } = await context.params;
  const eventIdNum = Number(eventId);

  if (isNaN(eventIdNum)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  try {
    // Check all ticketTypes and tickets related to the event
    const ticketTypes = await db.ticketType.findMany({
      where: { eventId: eventIdNum },
      include: {
        tickets: {
          include: {
            purchasedTicket: true,
            checkIn: true,
          },
        },
      },
    });

    // Construct CSV content
    let csv = "TicketType Name,Total, Sold, Checked-In\n";

    for (const tt of ticketTypes) {
      const total = tt.quantity;
      const sold = tt.tickets.filter((t) => t.purchasedTicket).length;
      const checkedIn = tt.tickets.filter(
        (t) => t.purchasedTicket?.checkedIn,
      ).length;
      csv += `"${tt.name}",${total},${sold},${checkedIn}\n`;
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="event_${eventId}_checkin_summary.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate check-in summary CSV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
