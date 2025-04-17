'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AppShell from '@/components/layout/AppShell';
import { EventCard } from '@/components/ui/EventCard';

interface Event {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  organizerName: string;
}

export default function StaffEventsPage() {
  const { userId } = useParams() as { userId: string };
  const { data: session, status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    const sessionUserId = String(session?.user?.id);
    const isAuthorized = session?.user?.role === 'Staff' && sessionUserId === userId;

    if (!isAuthorized) {
      router.replace('/login');
      return;
    }

    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/staffs/${userId}/events`);
        const { data } = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [session, status, userId, router]);

  if (status === 'loading' || loading) {
    return (
      <AppShell>
        <div className="p-6 text-gray-500">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">All Events</h1>

        {events.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => (
              <EventCard
              key={event.id}
              event={{
                id: event.id,
                name: event.name,
                startDate: event.startDate,
                endDate: event.endDate,
                status: event.status,
                organizerName: event.organizerName,
              }}
              href={`/dashboard/staff/${userId}/events/${event.id}`} // 👈 正确路径
              showActions={false} // 👈 禁用编辑和删除按钮
            />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}