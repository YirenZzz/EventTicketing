import { db } from "@/lib/db";
import { getRandomCoverImage } from '@/lib/randomCover';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { uploadCoverImageFromURL } from '@/lib/aws';
import { uploadImageFromUrlToS3 } from '@/lib/aws/upload';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const userIdNum = Number(userId);
  if (isNaN(userIdNum)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const { searchParams } = req.nextUrl;
  const filterStatus = searchParams.get("status");
  const query = searchParams.get("q")?.toLowerCase() || ""; // 👈 搜索关键词（默认空）

  try {
    const allEvents = await db.event.findMany({
      where: { organizerId: userIdNum },
      include: {
        ticketTypes: {
          include: {
            tickets: {
              select: { purchased: true, checkedIn: true },
            },
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    const now = new Date();

    const filteredEvents = allEvents
      .filter((ev) => {
        const isEnded = new Date(ev.endDate) < now;
        if (!filterStatus || filterStatus === 'ALL') return true;
        return filterStatus === "ENDED" ? isEnded : !isEnded;
      })
      .filter((ev) =>
        ev.name.toLowerCase().includes(query) // 👈 搜索过滤（忽略大小写）
      );

    const data = filteredEvents.map((ev) => {
      const allTickets = ev.ticketTypes.flatMap((tt) => tt.tickets);
      const sold = allTickets.filter((t) => t.purchased).length;
      const checkedIn = allTickets.filter((t) => t.checkedIn).length;

      return {
        id: ev.id,
        name: ev.name,
        description: ev.description,
        location: ev.location,
        startDate: ev.startDate,
        endDate: ev.endDate,
        status: ev.status,
        coverImage: ev.coverImage,
        ticketTypes: ev.ticketTypes,
        totalTickets: allTickets.length,
        soldTickets: sold,
        checkedIn,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch organizer events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'Organizer') {
    return NextResponse.json({ error: 'Only organizers can create events' }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, location, startDate, endDate, coverImage } = body;

  try {
    let finalCoverImage = coverImage;

    // ✅ 如果没传封面图，自动使用稳定 seed + picsum 随机图并上传至 S3
    if (!coverImage) {
      const seed = `${name}-${Date.now()}`; // 可加入 style 前缀也行
      const tempImage = getRandomCoverImage(seed); // https://picsum.photos/seed/xxx
      finalCoverImage = await uploadImageFromUrlToS3(tempImage); // 上传到 S3，返回 URL
    }

    const event = await db.event.create({
      data: {
        name,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'UPCOMING',
        coverImage: finalCoverImage,
        organizer: { connect: { id: Number(session.user.id) } },
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "Organizer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("id");
  if (!eventId) {
    return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
  }

  try {
    const event = await db.event.findUnique({
      where: { id: Number(eventId) },
      select: { organizerId: true },
    });

    if (!event || event.organizerId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.event.delete({ where: { id: Number(eventId) } });

    return NextResponse.json({ message: "Event deleted" });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
