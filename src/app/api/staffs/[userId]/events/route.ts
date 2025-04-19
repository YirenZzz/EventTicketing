// src/app/api/staffs/[userId]/events/route.ts

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  // 先 await context.params
  const { userId } = await context.params;
  const userIdNum = Number(userId);

  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    session.user.role !== "Staff" ||
    Number(session.user.id) !== userIdNum
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const events = await db.event.findMany({
      orderBy: { startDate: "asc" },
      include: {
        organizer: { select: { name: true } },
        ticketTypes: {
          include: {
            tickets: {
              select: { purchased: true, checkedIn: true, waitlisted: true },
            },
          },
        },
      },
    });

    const data = events.map((evt) => {
      // 统计票务数据
      const allTickets = evt.ticketTypes.flatMap((tt) => tt.tickets);
      const totalTickets = allTickets.length;
      const soldTickets = allTickets.filter((t) => t.purchased).length;
      const checkedIn = allTickets.filter(
        (t) => t.purchased && t.checkedIn
      ).length;

      return {
        id: evt.id,
        name: evt.name,
        startDate: evt.startDate,
        endDate: evt.endDate,
        status: evt.status,
        coverImage: evt.coverImage,
        organizerName: evt.organizer.name,
        totalTickets,
        soldTickets,
        checkedIn,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch staff-accessible events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
