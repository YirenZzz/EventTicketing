"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { OrganizerShell } from "@/components/layout/OrganizerShell";
import { StatCard } from "@/components/ui/StatCard";
import { StepCard } from "@/components/ui/StepCard";
import { EventCard } from "@/components/ui/EventCard";
import {
  ShoppingCart,
  Users,
  CreditCard,
  Wallet,
  Eye,
  FileCheck,
} from "lucide-react";

export default function OrganizerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId?.toString();

  const [events, setEvents] = useState<any[]>([]);
  const [grossSales, setGrossSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    const sessionUserId = String(session?.user?.id);
    const isAuthorized =
      session?.user?.role === "Organizer" && sessionUserId === userId;

    if (!isAuthorized) {
      router.replace("/login");
      return;
    }

    async function fetchEvents() {
      try {
        const res = await fetch(
          `/api/organizers/${userId}/events?status=UPCOMING`,
        );
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        const evts = data.data || [];
        setEvents(evts);

        const resAll = await fetch(
          `/api/organizers/${userId}/events?status=ALL`,
        );
        const allJson = await resAll.json();
        const allEvents = allJson.data || [];

        // Calculate the gross revenue of the event
        const total = allEvents.reduce((sum: number, event: any) => {
          return sum + (event.totalRevenue ?? 0);
        }, 0);  

        setGrossSales(total);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
        setGrossSales(0);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [session, status, userId, router]);

  if (status === "loading") return null;
  if (
    !session ||
    session.user.role !== "Organizer" ||
    String(session.user.id) !== userId
  )
    return null;

  return (
    <OrganizerShell>
      <h1 className="text-3xl font-bold mb-6">
        Welcome back, {session.user.name} 👋
      </h1>

      <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">🚀 Get your event ready</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StepCard
            title="Make your event live"
            description="Your event must be live before you can sell tickets."
            actionLabel="Publish Event"
            onClick={() => router.push(`/dashboard/organizer/${userId}/events`)}
          />
          <StatCard
            icon={Wallet}
            label="Gross sales"
            value={`CA$${grossSales.toFixed(2)}`}
          />
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">Your Upcoming Events</h2>
        {loading ? (
          <p className="text-gray-500">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={{
                id: event.id.toString(),
                name: event.name,
                startDate: event.startDate,
                endDate: event.endDate,
                status: event.status || "Draft",
                coverImage: event.coverImage,
              }}
            />
          ))
        )}
      </div>
    </OrganizerShell>
  );
}
