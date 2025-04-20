'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Ticket,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';

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

interface EventData {
  eventId: number;
  name: string;
  start: string;
  end: string;
  purchases: Purchase[];
  coverSrc: string;
  isUpcoming: boolean;
}

export default function AttendeeActivityPage() {
  const { userId } = useParams() as { userId: string };
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'upcoming' | 'ended'>('upcoming');
  const [search, setSearch] = useState('');

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
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-10 w-full flex justify-between">
              <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-72 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (purchases.length === 0) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Your Events</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Ticket className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">You haven't purchased any tickets yet.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // 按 eventId 分组
  const eventsMap = new Map<number, { name: string; start: string; end: string; purchases: Purchase[] }>();
  purchases.forEach((p) => {
    if (!eventsMap.has(p.eventId)) {
      eventsMap.set(p.eventId, {
        name: p.eventName,
        start: p.eventStart,
        end: p.eventEnd,
        purchases: [],
      });
    }
    eventsMap.get(p.eventId)!.purchases.push(p);
  });

  const now = Date.now();
  const allEvents: EventData[] = Array.from(eventsMap.entries()).map(
    ([eventId, { name, start, end, purchases }]) => ({
      eventId,
      name,
      start,
      end,
      purchases,
      coverSrc: `https://picsum.photos/seed/${eventId}/400/200`,
      isUpcoming: new Date(start).getTime() > now,
    })
  );

  const filteredEvents = allEvents.filter((e) =>
    (view === 'upcoming' ? e.isUpcoming : !e.isUpcoming) &&
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Events</h1>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setView('upcoming')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
                view === 'upcoming' ? 'bg-black text-white' : 'text-black'
              }`}
            >
              UPCOMING
            </button>
            <button
              onClick={() => setView('ended')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
                view === 'ended' ? 'bg-black text-white' : 'text-black'
              }`}
            >
              ENDED
            </button>
          </div>

          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No events found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filteredEvents.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function EventCard({ event }: { event: EventData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <img
        src={event.coverSrc}
        alt="Event cover"
        className="w-full h-40 object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = event.coverSrc;
        }}
      />

      <div className="p-6 space-y-3">
        <h2 className="text-lg font-semibold">{event.name}</h2>

        <div className="text-sm text-gray-600 flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {format(new Date(event.start), 'PPpp')}
        </div>
        <div className="text-sm text-gray-600 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {format(new Date(event.end), 'PPpp')}
        </div>

        <div className="border-t pt-3 mt-2">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">Your Tickets</div>
            <span className="text-purple-700 bg-purple-100 px-2 py-1 text-xs rounded">
              {event.purchases.length} {event.purchases.length === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition text-sm"
          >
            <span>View details</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {isExpanded && (
            <ul className="mt-2 divide-y border rounded">
              {event.purchases.map((p) => (
                <li key={p.purchaseId} className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{p.ticketTypeName}</div>
                    {p.checkedIn ? (
                      <span className="text-green-700 bg-green-100 px-2 py-1 text-xs rounded flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" /> Checked In
                      </span>
                    ) : (
                      <span className="text-blue-700 bg-blue-100 px-2 py-1 text-xs rounded flex items-center">
                        <XCircle className="w-3 h-3 mr-1" /> Not Checked In
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <Ticket className="w-3 h-3 mr-1" />
                    Purchased: {format(new Date(p.purchasedAt), 'PPp')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}