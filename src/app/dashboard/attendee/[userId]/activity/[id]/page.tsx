'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Clock, ArrowLeft, Tag, User, ShoppingCart } from 'lucide-react';
import { use } from 'react'; // Added import for use
import AttendeeShell from '@/components/layout/AttendeeShell';

interface TicketAttendee {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  createdAt: Date;
  eventId: number;
}

interface Event {
  id: number;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  location: string | null;
  status: string;
  organizerId: number | null;
  organizerName?: string;
  tickets: TicketAttendee[];
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}?includeTickets=true`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch event details');
        }
        
        const data = await response.json();
        
        // Process event data from API response
        let eventData: Event;
        
        if (data.eventDetail) {
          // Using new extended format
          eventData = {
            ...data.eventDetail,
            startDate: new Date(data.eventDetail.startDate),
            endDate: new Date(data.eventDetail.endDate),
            organizerName: data.eventDetail.organizer?.name || 'Unknown',
            tickets: data.eventDetail.tickets.map((ticket: any) => ({
              ...ticket,
              createdAt: new Date(ticket.createdAt)
            }))
          };
        } else if (data.event) {
          // Using old format
          eventData = {
            ...data.event,
            startDate: new Date(data.event.startDate),
            endDate: new Date(data.event.endDate),
            tickets: [],
            organizerName: data.event.organizerName
          };
        } else {
          throw new Error('Invalid event data format');
        }
        
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (status === 'authenticated') {
      fetchEventDetails();
    }
  }, [eventId, status]); // Updated dependency from params.id to eventId
  
  // Handle "Order Now" button click
  const handleOrderNow = (ticketId: number) => {
    router.push(`/orders?ticketId=${ticketId}`);
  };
  
  // Display loading state
  if (loading || status === 'loading') {
    return (
      <AttendeeShell>
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin h-8 w-8 border-4 border-purple-700 border-t-transparent rounded-full"></div>
        </div>
      </AttendeeShell>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <AttendeeShell>
        <div className="container max-w-4xl py-6">
          <Link href="/activity" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
          
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-700">Error Loading Event</h2>
            <p className="mt-2 text-red-600">{error}</p>
          </div>
        </div>
      </AttendeeShell>
    );
  }
  
  // Display not found state
  if (!event) {
    return (
      <AttendeeShell>
        <div className="container max-w-4xl py-6">
          <Link href="/activity" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
          
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="h-12 w-12 text-yellow-500 mx-auto mb-4">🔍</div>
            <h2 className="text-xl font-semibold">Event Not Found</h2>
            <p className="mt-2 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </AttendeeShell>
    );
  }
  
  // Get user ID for the back link
  const userId = session?.user?.id || "1";
  const userRole = (session?.user?.role || "attendee").toLowerCase();
  
  // Format dates
  const formattedStartDate = format(event.startDate, 'EEEE, MMMM d, yyyy');
  const formattedStartTime = format(event.startDate, 'h:mm a');
  const formattedEndTime = format(event.endDate, 'h:mm a');
  const sameDay = format(event.startDate, 'yyyy-MM-dd') === format(event.endDate, 'yyyy-MM-dd');
  
  // Determine status styling
  let statusColor = "bg-blue-100 text-blue-800";
  if (event.status === "CANCELLED") {
    statusColor = "bg-red-100 text-red-800";
  } else if (new Date() > event.endDate) {
    statusColor = "bg-gray-100 text-gray-800";
  } else if (new Date() > event.startDate) {
    statusColor = "bg-green-100 text-green-800";
  }
  
  return (
    <AttendeeShell>
      <div className="container max-w-4xl py-6">
        {/* Back to Events Link */}
        <Link href="/activity" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>
        
        {/* Event Header */}
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold">🔥 {event.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                {event.status}
              </span>
            </div>
            
            {/* Event Details */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span>📅 {formattedStartDate}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span>⏰ {formattedStartTime} - {formattedEndTime}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span>📍 {event.location}</span>
                </div>
              )}
              
              {event.organizerId && (
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span>👤 Organized by: {event.organizerName}</span>
                </div>
              )}
            </div>
            
            {/* Event Description */}
            {event.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">About This Event</h2>
                <p className="text-gray-700">{event.description}</p>
              </div>
            )}
          </div>
          
          {/* Tickets Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              🎟️ Available Tickets
            </h2>
            
            {event.tickets && event.tickets.length > 0 ? (
              <div className="space-y-4">
                {event.tickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">🏷️ {ticket.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span>👥 {ticket.sold} / {ticket.quantity} sold</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-700">
                          💰 ${ticket.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {ticket.quantity - ticket.sold === 0 ? 
                            '❌ Sold Out' : 
                            `✅ ${ticket.quantity - ticket.sold} remaining`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleOrderNow(ticket.id)}
                        disabled={ticket.quantity - ticket.sold === 0 || event.status === "CANCELLED"}
                        className="inline-flex items-center px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {ticket.quantity - ticket.sold === 0 ? 'Sold Out' : '🛒 Order Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No tickets available for this event.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Back to Dashboard Link */}
        <div className="mt-6">
          <Link 
            href={`/dashboard/${userRole}/${userId}`} 
            className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </AttendeeShell>
  );
}