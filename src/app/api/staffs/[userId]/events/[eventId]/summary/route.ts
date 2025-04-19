import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ userId: string; eventId: string }> },
) {
  const { eventId } = await context.params;
  const eventIdNum = Number(eventId);

  if (isNaN(eventIdNum)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  try {
    const totalTickets = await db.ticket.count({
      where: { ticketType: { eventId: eventIdNum } },
    });

    const soldTickets = await db.ticket.count({
      where: { ticketType: { eventId: eventIdNum }, purchased: true },
    });

    const checkedIn = await db.ticket.count({
      where: {
        ticketType: { eventId: eventIdNum },
        purchased: true,
        checkedIn: true,
      },
    });

    const revenueData = await db.ticket.findMany({
      where: {
        ticketType: { eventId: eventIdNum },
        purchased: true,
      },
      select: {
        ticketType: {
          select: {
            price: true,
          },
        },
      },
    });

    const totalRevenue = revenueData.reduce(
      (sum, t) => sum + t.ticketType.price,
      0,
    );

    const ticketTypes = await db.ticketType.findMany({
      where: { eventId: eventIdNum },
      include: {
        tickets: {
          include: {
            purchasedTicket: true,
          },
        },
      },
    });

    const ticketTypeStats = ticketTypes.map((tt) => {
      const total = tt.quantity;
      const sold = tt.tickets.filter((t) => t.purchased).length;
      const checkedIn = tt.tickets.filter(
        (t) => t.purchased && t.checkedIn,
      ).length;

      return {
        ticketTypeId: tt.id,
        name: tt.name,
        total,
        sold,
        checkedIn,
      };
    });

    return NextResponse.json({
      totalTickets,
      soldTickets,
      checkedIn,
      totalRevenue,
      ticketTypeStats,
    });
  } catch (error) {
    console.error("Failed to fetch summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
