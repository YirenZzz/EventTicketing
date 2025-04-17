'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import AppShell from '@/components/layout/AppShell';

interface TicketType {
  id: number;
  name: string;
  price: number;
  total: number;
  available: number;
}

interface EventDetail {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  location: string | null;
  description: string | null;
}

export default function AttendeeEventDetailPage() {
  const params = useParams();
  const { userId, eventId } = params as { userId: string; eventId: string };

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  /* ─────────── Fetch event, tickets, and purchased info ─────────── */
  useEffect(() => {
    (async () => {
      try {
        const [eventRes, purchaseRes] = await Promise.all([
          fetch(`/api/attendees/${userId}/events/${eventId}/ticket-types`),
          fetch(`/api/attendees/${userId}/purchased`)
        ]);

        if (eventRes.ok) {
          const { event, ticketTypes } = await eventRes.json();
          setEvent(event);
          setTickets(ticketTypes);
        }

        if (purchaseRes.ok) {
          const { data } = await purchaseRes.json();
          const purchased = data
            .filter((t: any) => t.eventId === Number(eventId))
            .map((t: any) => t.ticketTypeId);
          setPurchasedIds(purchased);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, eventId]);

  /* ─────────── Purchase handler ─────────── */
  async function buy(ticketTypeId: number) {
    const res = await fetch(`/api/attendees/${userId}/purchased`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketTypeId }),
    });

    if (!res.ok) {
      try {
        const { error } = await res.json();
        alert(error ?? 'Purchase failed');
      } catch {
        alert('Purchase failed');
      }
      return;
    }

    const { remaining } = await res.json();

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketTypeId ? { ...t, available: remaining } : t
      )
    );

    setPurchasedIds(prev => [...prev, ticketTypeId]);
    alert('Ticket purchased!');
  }

  /* ─────────── UI rendering ─────────── */
  if (loading) return <p className="p-8 text-center">Loading …</p>;
  if (!event) return <p className="p-8 text-center text-red-500">Event not found.</p>;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Event Header */}
        <h1 className="text-3xl font-bold">{event.name}</h1>

        <div className="text-gray-600 space-y-1">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(event.startDate), 'PPpp')} – {format(new Date(event.endDate), 'PPpp')}
          </div> 
          <div className="flex items-center text-sm">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location ?? 'TBA'}
          </div>
        </div>

        {event.description && <p className="text-gray-700">{event.description}</p>}

        {/* Ticket Types */}
        <h2 className="text-xl font-semibold mt-6">Ticket Types</h2>

        <div className="space-y-4">
          {tickets.map((t) => {
            const isPurchased = purchasedIds.includes(t.id);
            const soldOut = t.available === 0;

            return (
              <div
                key={t.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                {/* Left info */}
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-gray-600">
                    ${t.price.toFixed(2)}
                    {!isPurchased && soldOut && (
                      <> ・ <span className="text-red-500 font-medium">Sold Out</span></>
                    )}
                    {!isPurchased && t.available > 0 && t.available <= 3 && (
                      <> ・ <span className="text-red-500 font-medium">only {t.available} left</span></>
                    )}
                  </div>
                </div>

                {/* Right actions */}
                {isPurchased ? (
                  <span className="text-sm text-green-600 font-medium">
                    Already Purchased
                  </span>
                ) : soldOut ? (
                  <span className="text-sm text-red-500 font-medium">
                    Sold Out
                  </span>
                ) : (
                  <button
                    onClick={() => buy(t.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                  >
                    Buy
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}