'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';

interface EventWithStatus {
  id: number;
  name: string;
  startDate: string;
  location: string;
  isRegistered: boolean;
  hasAvailableTickets: boolean;
  minTicketPrice: number;
}

export default function AttendeeEventListPage() {
  const params = useParams();
  const userId = params?.userId?.toString();
  const [events, setEvents] = useState<EventWithStatus[]>([]);

  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const fetchEvents = async () => {
      const res = await fetch(`/api/attendees/${userId}/events`);
      const { data } = await res.json();
      setEvents(data);
    };

    fetchEvents();
  }, [userId]);

  return (
    <AppShell>
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Events</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-lg shadow p-6 space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{event.name}</h2>
              {event.isRegistered ? (
                <span className="text-green-700 bg-green-100 px-2 py-1 text-xs rounded">Registered</span>
              ) : (
                <span className="text-blue-700 bg-blue-100 px-2 py-1 text-xs rounded">Not Registered</span>
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
                <span className="text-red-500">Sold Out</span>
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
                {event.hasAvailableTickets ? 'Buy Now' : 'Sold Out'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
    </AppShell>
  );
}