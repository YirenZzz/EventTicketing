'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/ui/EventCard';
import CreateEventModal from '@/components/modals/CreateEventModal';
import AppShell from '@/components/layout/AppShell'; // ✅ 引入全局 layout

export default function EventsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const status = searchParams.get('status') || 'UPCOMING';
  const query = searchParams.get('q') || '';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    setLoading(true);
    const url = `/api/events?status=${status}&q=${query}&page=${page}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  }, [status, query, page]);

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/events?${params.toString()}`);
  };

  return (
    <AppShell> {/* ✅ 包裹内容 */}
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Upcoming Events</h1>
          <Button onClick={() => setOpen(true)}>+ Create new</Button>
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
          <>
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-gray-500">No events found.</p>
              ) : (
                events.map((event) => <EventCard key={event.id} event={event} />)
              )}
            </div>

            <div className="flex gap-2 mt-6 items-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateSearchParams('page', String(page - 1))}
                disabled={page <= 1}
              >
                &lt;
              </Button>
              <span className="text-sm">Page {page} of {meta.totalPages}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateSearchParams('page', String(page + 1))}
                disabled={page >= meta.totalPages}
              >
                &gt;
              </Button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}