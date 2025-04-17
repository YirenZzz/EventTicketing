'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import SearchBackHeader from '@/components/layout/SearchBackHeader';

interface EventWithStatus {
  id: number;
  name: string;
  startDate: string;
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Handle search function
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    if (!userId) return;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendees/${userId}/events`);
        const { data } = await res.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [userId]);

  // Filter events based on search query
  const filteredEvents = searchQuery.trim()
    ? events.filter(event => {
        const query = searchQuery.toLowerCase();
        return (
          // Search by event name
          event.name.toLowerCase().includes(query) ||
          // Search by location
          event.location.toLowerCase().includes(query) ||
          // Search by date
          format(new Date(event.startDate), 'PPpp').toLowerCase().includes(query) ||
          // Search by registration status
          (event.isRegistered && "registered".includes(query)) ||
          (!event.isRegistered && "not registered".includes(query)) ||
          // Search by ticket availability
          (event.hasAvailableTickets && "available".includes(query)) ||
          (!event.hasAvailableTickets && "sold out".includes(query)) ||
          // Search by price
          (event.minTicketPrice?.toString().includes(query))
        );
      })
    : events;

  return (
    <AppShell>
      <SearchBackHeader
        searchPlaceholder="Search events by name, location, date..."
        onSearchChange={handleSearch}
        searchValue={searchQuery}
        showBackButton={true}
        backUrl={`/dashboard/attendee/${userId}`}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Explore Events</h1>
          
          {/* Search results count */}
          {searchQuery.trim() && (
            <div className="text-sm text-gray-600">
              {filteredEvents.length === 0 ? (
                <span>No events found</span>
              ) : (
                <span>
                  Found {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-700 border-t-transparent" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-2">No events found matching "{searchQuery}"</p>
            <p className="text-sm text-gray-500">
              Try adjusting your search terms or clear the search to see all events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div 
                key={event.id} 
                className={`bg-white rounded-lg shadow overflow-hidden transition-shadow hover:shadow-md ${
                  searchQuery.trim() && event.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ? 'ring-2 ring-purple-300'
                    : ''
                }`}
              >
                <img
                  src={event.coverImage?.trim() || `https://picsum.photos/seed/${event.id}/400/200`}
                  alt="Event cover"
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/400/200?random=${event.id}`;
                  }}
                />
                <div className="p-6 space-y-2">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}