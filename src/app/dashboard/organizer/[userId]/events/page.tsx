'use client';

import { use, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/ui/EventCard';
import CreateEventModal from '@/components/modals/CreateEventModal';
import AppShell from '@/components/layout/AppShell';

export default function OrganizerEventsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params); 

  const searchParams = useSearchParams();
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const status = searchParams.get('status') || 'UPCOMING';
  const query = searchParams.get('q') || '';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    setLoading(true);
    const url = `/api/organizers/${userId}/events?status=${status}&q=${query}&page=${page}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data?.data || []);
        setMeta(data?.meta || { page: 1, totalPages: 1 });
      })
      .catch((err) => {
        console.error('Failed to load events:', err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, [userId, status, query, page]);

  const updateSearchParams = (key: string, value: string) => {
    const paramsObj = new URLSearchParams(searchParams.toString());
    paramsObj.set(key, value);
    router.push(`/dashboard/organizer/${userId}/events?${paramsObj.toString()}`);
  };

  return (
    <AppShell>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Your Events</h1>
          <Button onClick={() => setOpen(true)}>+ Create Event</Button>
        </div>

        <CreateEventModal
          open={open}
          onClose={() => setOpen(false)}
          onCreated={(newEvent) => {
            setEvents((prev) => [newEvent, ...prev]);
            setOpen(false);
          }}
        />

        <div className="flex gap-4 mb-4">
          {['UPCOMING', 'ENDED', 'ARCHIVED'].map((s) => (
            <Button
              key={s}
              variant={status === s ? 'default' : 'ghost'}
              onClick={() => updateSearchParams('status', s)}
            >
              {s}
            </Button>
          ))}
        </div>

        <Input
          placeholder="Search by name"
          value={query}
          onChange={(e) => updateSearchParams('q', e.target.value)}
          className="mb-4"
        />

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-gray-500">No events created yet.</p>
            ) : (
              events.map((event) => <EventCard key={event.id} event={event} />)
            )}
          </div>
        )}

        <div className="flex gap-2 mt-6 items-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateSearchParams('page', String(page - 1))}
            disabled={page <= 1}
          >
            &lt;
          </Button>
          <span className="text-sm">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateSearchParams('page', String(page + 1))}
            disabled={page >= meta.totalPages}
          >
            &gt;
          </Button>
        </div>
      </div>
    </AppShell>
  );
}