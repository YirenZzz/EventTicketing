// src/app/dashboard/attendee/[userId]/activity/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Purchase {
  purchaseId: number;
  purchasedAt: string;
  eventId: number;
  eventName: string;
  eventStart: string;
  eventEnd: string;
  ticketTypeName: string;
  checkedIn: boolean;
}

export default function AttendeeActivityPage() {
  const { userId } = useParams() as { userId: string };
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/attendees/${userId}/purchased`, { cache: 'no-store' });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const { data } = await res.json();
      setPurchases(data);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return <p className="p-8 text-center">Loading…</p>;
  }

  if (purchases.length === 0) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto p-8 text-center text-gray-500">
          You haven’t purchased any tickets yet.
        </div>
      </AppShell>
    );
  }

  // 1. Group by event
  const eventsMap = new Map<
    number,
    { name: string; start: string; end: string; purchases: Purchase[] }
  >();
  purchases.forEach((p) => {
    const grp = eventsMap.get(p.eventId);
    if (grp) {
      grp.purchases.push(p);
    } else {
      eventsMap.set(p.eventId, {
        name: p.eventName,
        start: p.eventStart,
        end: p.eventEnd,
        purchases: [p],
      });
    }
  });

  // 2. Only future events, sorted by start ascending
  const now = Date.now();
  const upcomingEvents = Array.from(eventsMap.entries())
    .map(([eventId, { name, start, end, purchases }]) => ({
      eventId,
      name,
      start,
      end,
      purchases,
    }))
    .filter(({ start }) => new Date(start).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.start).getTime() - new Date(b.start).getTime()
    );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-8 space-y-4">
        <h1 className="text-2xl font-bold">Your Upcoming Events</h1>

        {upcomingEvents.map(({ eventId, name, start, end, purchases }) => {
          const isOpen = expanded.has(eventId);
          return (
            <div key={eventId} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    next.has(eventId) ? next.delete(eventId) : next.add(eventId);
                    return next;
                  });
                }}
                className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 transition"
              >
                <div className="text-left">
                  <div className="font-medium">{name}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(start).toLocaleString()} &ndash;{' '}
                    {new Date(end).toLocaleString()}
                  </div>
                </div>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </button>

              {isOpen && (
                <ul className="divide-y">
                  {purchases.map((p) => (
                    <li
                      key={p.purchaseId}
                      className="px-4 py-3 flex justify-between"
                    >
                      <div>
                        <div className="font-medium">{p.ticketTypeName}</div>
                        <div className="text-sm text-gray-500">
                          Purchased: {new Date(p.purchasedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm">
                        {p.checkedIn ? '✅ Checked‑In' : '❌ Not Checked‑In'}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}