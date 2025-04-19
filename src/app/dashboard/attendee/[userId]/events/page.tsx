'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';

interface EventWithStatus {
  id: number;
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  isRegistered: boolean;
  hasAvailableTickets: boolean;
  minTicketPrice: number;
  coverImage?: string | null;
}


export default function AttendeeEventListPage() {
  const params = useParams();
  const userId = params?.userId?.toString();
  const [events, setEvents] = useState<EventWithStatus[]>([]);
  const [view, setView] = useState<'upcoming' | 'ended'>('upcoming');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const res = await fetch(`/api/attendees/${userId}/events`);
      if (!res.ok) return;
      const { data } = await res.json();
      setEvents(data);
    })();
  }, [userId]);

  const now = new Date();
  const filteredEvents = events.filter((e) => {
    // 用 endDate 判断是否结束（若没有 endDate 则当未结束处理）
    const start = e.startDate ? new Date(e.startDate) : new Date(0);
    const matchStatus = view === 'upcoming' ? start > now : start <= now;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Explore Events</h1>

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
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-gray-500 text-center py-16">No events found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              // 取后端 coverImage 或 picsum seed
              const coverSrc =
                event.coverImage?.trim() ||
                `https://picsum.photos/seed/${event.id}/400/200`;

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <img
                    src={coverSrc}
                    alt="Event cover"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      // 失败时重试同一个 seed
                      (e.currentTarget as HTMLImageElement).src =
                        `https://picsum.photos/seed/${event.id}/400/200`;
                    }}
                  />

                  <div className="p-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">{event.name}</h2>
                      {event.isRegistered ? (
                        <span className="text-green-700 bg-green-100 px-2 py-1 text-xs rounded">
                          Registered
                        </span>
                      ) : (
                        <span className="text-blue-700 bg-blue-100 px-2 py-1 text-xs rounded">
                          Not Registered
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(event.startDate), 'PPpp')}
                    </div>

                    <div className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.location}
                    </div>

                    <div className="text-sm text-gray-600 flex items-center">
                      <Ticket className="w-4 h-4 mr-1" />
                      {event.hasAvailableTickets ? (
                        <span>From ${event.minTicketPrice}</span>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-red-500">Sold out</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right mt-2">
                      <Link
                        href={`/dashboard/attendee/${userId}/events/${event.id}`}
                        className={`inline-block px-4 py-2 text-sm rounded transition ${
                          event.hasAvailableTickets
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {event.hasAvailableTickets ? 'Buy Now' : 'Join Waitlist'}
                      </Link>
          
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}