'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Tag, Search, ArrowRight } from 'lucide-react';
import AttendeeShell from '@/components/layout/AttendeeShell';

interface TicketAttendee {
  id: number;
  name: string; 
  price: number;
  quantity: number;
  sold: number;
}

interface Event {
  id: number;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  location: string | null;
  status: string;
  tickets: TicketAttendee[];
  organizerId: number | null;
}

export default function EventsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch events from the API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events?includeTickets=true');
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        
        // Map the API response to our event interface
        const eventsList: Event[] = data.data.map((event: any) => ({
          id: event.id,
          name: event.name,
          description: event.description,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          location: event.location,
          status: event.status,
          tickets: event.tickets || [],
          organizerId: event.organizerId
        }));
        
        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (status === 'authenticated') {
      fetchEvents();
    }
  }, [status]);

  // Filter events based on search term
  const filteredEvents = events.filter(event => 
    event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get minimum ticket price for an event
  const getMinTicketPrice = (tickets: TicketAttendee[]): number => {
    if (!tickets || tickets.length === 0) return 0;
    return Math.min(...tickets.map(ticket => ticket.price));
  };

  // Check if user is registered for an event (simplified mock version)
  // In a real app, you would check against registration records
  const isUserRegistered = (eventId: number): boolean => {
    // Mock logic - in real app, check against user registrations
    return false;
  };

  // Display loading state
  if (loading) {
    return (
      <AttendeeShell>
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin h-8 w-8 border-4 border-purple-700 border-t-transparent rounded-full"></div>
        </div>
      </AttendeeShell>
    );
  }

  // Get user ID for the back link
  const userId = session?.user?.id || "1";
  const userRole = (session?.user?.role || "attendee").toLowerCase();

  return (
    <AttendeeShell>
      <div className="space-y-6">
        {/* Back to Dashboard Link */}
        {/* <Link href={`/dashboard/${userRole}/${userId}`} className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
          <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
         */}
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <span className="bg-red-100 text-red-800 text-xl font-semibold mr-2 px-2.5 py-0.5 rounded-md">
              17
            </span>
            Browse Events
          </h1>
          
          {/* Search Bar */}
          <div className="mt-4 md:mt-0 relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Events List */}
        <div className="space-y-6">
          {filteredEvents.length > 0 ? (
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      {/* Placeholder instead of actual image */}
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">📷 Cover Image</span>
                      </div>
                    </div>
                    
                    <div className="p-6 md:w-2/3 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">🔥 {event.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                              ${event.status === 'CANCELLED' 
                                ? 'bg-red-100 text-red-800'
                                : event.status === 'UPCOMING' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {event.status}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center text-gray-600 text-sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>📅 {format(event.startDate, "MMMM d, h:mm a")}</span>
                          </div>
                          
                          {event.location && (
                            <div className="mt-1 flex items-center text-gray-600 text-sm">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>📍 {event.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-gray-600">📖 {event.description}</p>
                        )}
                        
                        {event.tickets && event.tickets.length > 0 && (
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-1 text-gray-600" />
                            <span className="text-sm text-gray-600">
                              Tickets from ${getMinTicketPrice(event.tickets)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          {isUserRegistered(event.id) ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Registered
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              🟢 Not Registered
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button 
                          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                          onClick={() => router.push(`/activity/${event.id}`)}
                        >
                          <span>🔍 View Details</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border-dashed border-2 rounded-lg p-10 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 text-gray-400 mb-4">🎟️</div>
              <h3 className="text-lg font-medium mb-2">No events available</h3>
              <p className="text-gray-500 max-w-sm mb-6">
                {searchTerm 
                  ? `No events found matching "${searchTerm}". Try a different search term.` 
                  : 'There are no upcoming events at the moment. Please check back later for new events.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AttendeeShell>
  );
}