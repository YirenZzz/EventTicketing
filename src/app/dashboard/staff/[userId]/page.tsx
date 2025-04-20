"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { OrganizerShell } from "@/components/layout/OrganizerShell";
import { StepCard } from "@/components/ui/StepCard";
import { EventCard } from "@/components/ui/EventCard";

interface Event {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  organizerName: string;
}

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId?.toString();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    const sessionUserId = String(session?.user?.id);
    const isAuthorized =
      session?.user?.role === "Staff" && sessionUserId === userId;

    if (!isAuthorized) {
      router.replace("/login");
      return;
    }

    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/staffs/${userId}/events`);
        if (!res.ok) throw new Error("Failed to fetch events");
        const { data } = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error("Error loading events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [session, status, userId, router]);

  if (status === "loading" || loading) return null;
  const sessionUserId = String(session?.user?.id);
  if (session?.user?.role !== "Staff" || sessionUserId !== userId) return null;

  return (
    <OrganizerShell>
      <h1 className="text-3xl font-bold mb-6">
        Welcome back, {session.user.name} 👋
      </h1>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          🚀 Prepare for staff duties
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StepCard
            title="Check-in"
            description="Scan attendee QR codes to validate tickets."
            actionLabel="Go to Check-in"
            onClick={() => router.push(`/dashboard/staff/${userId}/checkin`)}
          />
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold mb-2">Assigned Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-500">No events assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {" "}
            {/* Each line */}
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  id: event.id.toString(),
                  name: event.name,
                  startDate: event.startDate,
                  endDate: event.endDate,
                  status: event.status,
                  organizerName: event.organizerName,
                }}
                href={`/dashboard/staff/${userId}/events/${event.id}`}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </OrganizerShell>
  );
}
