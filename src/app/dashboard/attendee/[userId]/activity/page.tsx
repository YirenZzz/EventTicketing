'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { ChevronDown, ChevronUp, Calendar, Clock, Ticket, CheckCircle, XCircle, Search } from 'lucide-react';
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

export default function AttendeeActivityPage() {
  const { userId } = useParams() as { userId: string };
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
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

  // 2. Map to array of events with additional properties
  const now = Date.now();
  const allEvents = Array.from(eventsMap.entries())
    .map(([eventId, { name, start, end, purchases }]) => ({
      eventId,
      name,
      start,
      end,
      purchases,
      // Generate a random seed for image based on eventId
      coverSrc: `https://picsum.photos/seed/${eventId}/400/200`,
      isUpcoming: new Date(start).getTime() > now
    }));

  // 3. Filter based on view (upcoming/ended) and search
  const filteredEvents = allEvents.filter(event => {
    const matchesView = view === 'upcoming' ? event.isUpcoming : !event.isUpcoming;
    const matchesSearch = event.name.toLowerCase().includes(search.toLowerCase());
    return matchesView && matchesSearch;
  });

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Events</h1>
        
        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Tabs */}
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

          {/* Search */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(({ eventId, name, start, end, purchases, coverSrc }) => (
              <div key={eventId} className="bg-white rounded-lg shadow overflow-hidden">
                <img
                  src={coverSrc}
                  alt="Event cover"
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    // Retry with same seed if fails
                    (e.currentTarget as HTMLImageElement).src = 
                      `https://picsum.photos/seed/${eventId}/400/200`;
                  }}
                />
                
                <div className="p-6 space-y-3">
                  <h2 className="text-lg font-semibold">{name}</h2>
                  
                  <div className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(start), 'PPpp')}
                  </div>
                  
                  <div className="text-sm text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {format(new Date(end), 'PPpp')}
                  </div>
                  
                  <div className="border-t pt-3 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium">Your Tickets</div>
                      <span className="text-purple-700 bg-purple-100 px-2 py-1 text-xs rounded">
                        {purchases.length} {purchases.length === 1 ? 'ticket' : 'tickets'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => {
                        setExpanded((prev) => {
                          const next = new Set(prev);
                          next.has(eventId) ? next.delete(eventId) : next.add(eventId);
                          return next;
                        });
                      }}
                      className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition text-sm"
                    >
                      <span>View details</span>
                      {expanded.has(eventId) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    
                    {expanded.has(eventId) && (
                      <ul className="mt-2 divide-y border rounded">
                        {purchases.map((p) => (
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
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}