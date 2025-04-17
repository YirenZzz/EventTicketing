'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, MapPin, Clock, ArrowLeft, ShoppingCart, Info, Tag, Users } from 'lucide-react';
import { format } from 'date-fns';

// Types based on your Prisma schema
interface TicketAttendee {
  id: number;
  name: string;'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, MapPin, Clock, ArrowLeft, ShoppingCart, Info, Tag, Users } from 'lucide-react';
import { format } from 'date-fns';

// Types based on your Prisma schema
interface TicketAttendee {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  createdAt: Date;
  eventId: number;
}

interface EventOrganizer {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface EventDetail {
  id: number;
  name: string;
  description: string | null;
  startDate: string | Date;
  endDate: string | Date;
  location: string | null;
  status: string;
  createdAt: string | Date;
  organizerId: number | null;
  organizer: EventOrganizer | null;
  tickets: TicketAttendee[];
}

interface TicketManagerProps {
  eventId: number | string;
}

export default function TicketManager({ eventId }: TicketManagerProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        
        const data = await response.json();
        
        // Check if we have the event details in the new format
        if (data.eventDetail) {
          // Format dates properly
          const eventDetail = data.eventDetail;
          eventDetail.startDate = new Date(eventDetail.startDate);
          eventDetail.endDate = new Date(eventDetail.endDate);
          eventDetail.createdAt = new Date(eventDetail.createdAt);
          eventDetail.tickets.forEach((ticket: TicketAttendee) => {
            ticket.createdAt = new Date(ticket.createdAt);
          });
          
          setEvent(eventDetail);
        } else if (data.event) {
          // Fallback to old format
          const eventData = data.event;
          eventData.startDate = new Date(eventData.startDate);
          eventData.endDate = new Date(eventData.endDate);
          eventData.tickets = []; // No tickets in old format
          
          setEvent(eventData as EventDetail);
        } else {
          throw new Error('Invalid event data format');
        }
      } catch (err) {
        setError('Could not load event details. Please try again later.');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId]);
  
  const handleBuyTicket = (ticketId: number) => {
    // Redirect to orders and payment page with the ticket ID
    window.location.href = `/orders?ticketId=${ticketId}`;
    
    // Alternatively, you could show a toast and navigate programmatically
    toast({
      title: "Adding to cart",
      description: "Redirecting to payment page..."
    });
  };
  
  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-700 border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <Link href="/dashboard/attendee/1" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Info className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700">Error Loading Event</h2>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container max-w-4xl py-8">
        <Link href="/dashboard/attendee/1" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Info className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Event Not Found</h2>
          <p className="mt-2 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  // Properly format event dates for display
  const formattedStartDate = format(new Date(event.startDate), 'MMM d, yyyy • h:mm a');
  const formattedEndDate = format(new Date(event.endDate), 'MMM d, yyyy • h:mm a');
  const sameDay = format(new Date(event.startDate), 'yyyy-MM-dd') === format(new Date(event.endDate), 'yyyy-MM-dd');
  
  // Calculate event status for display
  const now = new Date();
  let statusColor = "text-blue-600 bg-blue-50 border-blue-200";
  
  if (event.status === "CANCELLED") {
    statusColor = "text-red-600 bg-red-50 border-red-200";
  } else if (now > new Date(event.endDate)) {
    statusColor = "text-gray-600 bg-gray-50 border-gray-200";
  } else if (now > new Date(event.startDate)) {
    statusColor = "text-green-600 bg-green-50 border-green-200";
  }
  
  // Get the user ID for the back link
  const userId = session?.user?.id || "1";
  const userRole = session?.user?.role?.toLowerCase() || "attendee";
  
  return (
    <div className="container max-w-4xl py-8">
      {/* Back to Dashboard Link */}
      <Link href={`/dashboard/${userRole}/${userId}`} className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>
      
      {/* Event Header */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">📛 {event.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor} border`}>
              {event.status}
            </span>
          </div>
          
          {/* Event Details */}
          <div className="mt-4 space-y-3">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">
                  🗓 {sameDay ? (
                    <>
                      {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
                    </>
                  ) : (
                    <>
                      {format(new Date(event.startDate), 'MMM d')} - {format(new Date(event.endDate), 'MMM d, yyyy')}
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p>
                  ⏰ {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                </p>
              </div>
            </div>
            
            {event.location && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <p>📍 {event.location}</p>
              </div>
            )}
          </div>
          
          {/* Event Description */}
          {event.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">About This Event</h2>
              <p className="text-gray-700 whitespace-pre-line">📖 {event.description}</p>
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
                        <Users className="h-4 w-4 mr-1" />
                        <span>👥 {ticket.sold} / {ticket.quantity} sold</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-700">
                        💰 ${ticket.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ticket.quantity - ticket.sold === 0 ? '❌ Sold Out' : `✅ ${ticket.quantity - ticket.sold} remaining`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleBuyTicket(ticket.id)}
                      disabled={ticket.quantity - ticket.sold === 0}
                      className="inline-flex items-center px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {ticket.quantity - ticket.sold === 0 ? 'Sold Out' : '🛒 Buy Now'}
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
      
      {/* Organizer Information */}
      {event.organizerId && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">👤 Organizer</h2>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
              <Users className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <p className="font-medium">
                {event.organizer?.name || `Organizer #${event.organizerId}`}
              </p>
              <button className="text-sm text-purple-600 hover:text-purple-800">
                View organizer profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  price: number;
  quantity: number;
  sold: number;
  createdAt: Date;
  eventId: number;
}

interface EventOrganizer {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface EventDetail {
  id: number;
  name: string;
  description: string | null;
  startDate: string | Date;
  endDate: string | Date;
  location: string | null;
  status: string;
  createdAt: string | Date;
  organizerId: number | null;
  organizer: EventOrganizer | null;
  tickets: TicketAttendee[];
}

interface TicketManagerProps {
  eventId: number | string;
}

export default function TicketManager({ eventId }: TicketManagerProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        
        const data = await response.json();
        
        // Check if we have the event details in the new format
        if (data.eventDetail) {
          // Format dates properly
          const eventDetail = data.eventDetail;
          eventDetail.startDate = new Date(eventDetail.startDate);
          eventDetail.endDate = new Date(eventDetail.endDate);
          eventDetail.createdAt = new Date(eventDetail.createdAt);
          eventDetail.tickets.forEach((ticket: TicketAttendee) => {
            ticket.createdAt = new Date(ticket.createdAt);
          });
          
          setEvent(eventDetail);
        } else if (data.event) {
          // Fallback to old format
          const eventData = data.event;
          eventData.startDate = new Date(eventData.startDate);
          eventData.endDate = new Date(eventData.endDate);
          eventData.tickets = []; // No tickets in old format
          
          setEvent(eventData as EventDetail);
        } else {
          throw new Error('Invalid event data format');
        }
      } catch (err) {
        setError('Could not load event details. Please try again later.');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId]);
  
  const handleBuyTicket = (ticketId: number) => {
    // Redirect to orders and payment page with the ticket ID
    window.location.href = `/orders?ticketId=${ticketId}`;
    
    // Alternatively, you could show a toast and navigate programmatically
    toast({
      title: "Adding to cart",
      description: "Redirecting to payment page..."
    });
  };
  
  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-700 border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <Link href="/dashboard/attendee/1" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Info className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700">Error Loading Event</h2>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container max-w-4xl py-8">
        <Link href="/dashboard/attendee/1" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Info className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Event Not Found</h2>
          <p className="mt-2 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  // Properly format event dates for display
  const formattedStartDate = format(new Date(event.startDate), 'MMM d, yyyy • h:mm a');
  const formattedEndDate = format(new Date(event.endDate), 'MMM d, yyyy • h:mm a');
  const sameDay = format(new Date(event.startDate), 'yyyy-MM-dd') === format(new Date(event.endDate), 'yyyy-MM-dd');
  
  // Calculate event status for display
  const now = new Date();
  let statusColor = "text-blue-600 bg-blue-50 border-blue-200";
  
  if (event.status === "CANCELLED") {
    statusColor = "text-red-600 bg-red-50 border-red-200";
  } else if (now > new Date(event.endDate)) {
    statusColor = "text-gray-600 bg-gray-50 border-gray-200";
  } else if (now > new Date(event.startDate)) {
    statusColor = "text-green-600 bg-green-50 border-green-200";
  }
  
  // Get the user ID for the back link
  const userId = session?.user?.id || "1";
  const userRole = session?.user?.role?.toLowerCase() || "attendee";
  
  return (
    <div className="container max-w-4xl py-8">
      {/* Back to Dashboard Link */}
      <Link href={`/dashboard/${userRole}/${userId}`} className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>
      
      {/* Event Header */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">📛 {event.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor} border`}>
              {event.status}
            </span>
          </div>
          
          {/* Event Details */}
          <div className="mt-4 space-y-3">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">
                  🗓 {sameDay ? (
                    <>
                      {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
                    </>
                  ) : (
                    <>
                      {format(new Date(event.startDate), 'MMM d')} - {format(new Date(event.endDate), 'MMM d, yyyy')}
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p>
                  ⏰ {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                </p>
              </div>
            </div>
            
            {event.location && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <p>📍 {event.location}</p>
              </div>
            )}
          </div>
          
          {/* Event Description */}
          {event.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">About This Event</h2>
              <p className="text-gray-700 whitespace-pre-line">📖 {event.description}</p>
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
                        <Users className="h-4 w-4 mr-1" />
                        <span>👥 {ticket.sold} / {ticket.quantity} sold</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-700">
                        💰 ${ticket.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ticket.quantity - ticket.sold === 0 ? '❌ Sold Out' : `✅ ${ticket.quantity - ticket.sold} remaining`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleBuyTicket(ticket.id)}
                      disabled={ticket.quantity - ticket.sold === 0}
                      className="inline-flex items-center px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {ticket.quantity - ticket.sold === 0 ? 'Sold Out' : '🛒 Buy Now'}
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
      
      {/* Organizer Information */}
      {event.organizerId && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">👤 Organizer</h2>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
              <Users className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <p className="font-medium">
                {event.organizer?.name || `Organizer #${event.organizerId}`}
              </p>
              <button className="text-sm text-purple-600 hover:text-purple-800">
                View organizer profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}