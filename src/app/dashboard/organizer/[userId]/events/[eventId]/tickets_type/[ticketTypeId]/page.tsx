'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import io from 'socket.io-client';
import AppShell from '@/components/layout/AppShell';
import { 
  Ticket, 
  Users, 
  Calendar, 
  Check, 
  X, 
  Clock, 
  User, 
  RefreshCw,
  Search,
  BarChart4
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

let socket: ReturnType<typeof io> | null = null;

export default function TicketTypeLivePage() {
  const { userId, eventId, ticketTypeId } = useParams() as {
    userId: string;
    eventId: string;
    ticketTypeId: string;
  };
  
  const [ticketType, setTicketType] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [numAddTickets, setNumAddTickets] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTicketType = async () => {
    setIsUpdating(true);
    const res = await fetch(
      `/api/organizers/${userId}/events/${eventId}/ticket-types/${ticketTypeId}`,
      { cache: 'no-store' }
    );
    if (!res.ok) {
      setIsUpdating(false);
      return;
    }
    const { ticketType } = await res.json();
    setTicketType(ticketType);
    setLoading(false);
    setLastUpdate(new Date());
    setIsUpdating(false);
  };

  useEffect(() => {
    fetchTicketType();
  }, [userId, eventId, ticketTypeId]);

  // Listen for ticketPurchased event
  useEffect(() => {
    if (!socket) {
      socket = io('/', { path: '/api/socket_io' });
    }
    
    const handler = (payload: { ticketTypeId: number }) => {
      if (payload.ticketTypeId === Number(ticketTypeId)) {
        fetchTicketType();
      }
    };
    
    socket.on('ticketPurchased', handler);
    return () => socket?.off('ticketPurchased', handler);
  }, [ticketTypeId]);

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-24 w-full bg-gray-200 rounded-lg"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 w-full bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!ticketType) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto p-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ticket Type Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find the requested ticket type information.</p>
            <button 
              onClick={fetchTicketType}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Calculate stats
  const totalTickets = ticketType.quantity;
  const soldTickets = ticketType.tickets.filter((t: any) => !!t.purchasedTicket).length;
  const waitlistTickets = ticketType.tickets.filter((t: any) => t.waitlisted).length;
  const checkedInTickets = ticketType.tickets.filter((t: any) => t.checkedIn).length;
  const availableTickets = totalTickets - soldTickets;

  // Filter tickets based on search
  const filteredTickets = ticketType.tickets.filter((ticket: any) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const code = ticket.code.toLowerCase();
    const userName = ticket.purchasedTicket?.user?.name?.toLowerCase() || '';
    
    return code.includes(searchLower) || userName.includes(searchLower);
  });

  async function handleAddTickets() {
    const numTickets = parseInt(numAddTickets, 10);

    if (!isNaN(numTickets) && numTickets > 0) {
      const res = await fetch(
        `/api/organizers/${userId}/events/${eventId}/ticket-types/${ticketTypeId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({numAddTickets: numTickets}),
          cache: "no-store"
        }
      );
      if (!res.ok) {
        setIsUpdating(false);
        return;
      }
      const { ticketType } = await res.json();
      setTicketType(ticketType);
      setLoading(false);
      setLastUpdate(new Date());
      setIsUpdating(false);
    } else {
      alert('Please enter a valid positive number');
    }

    alert(`Successfully added ${numAddTickets} new tickets!`);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <div className="flex items-center">
                <Ticket className="h-6 w-6 text-purple-600 mr-2" />
                <h1 className="text-2xl font-bold">{ticketType.name}</h1>
              </div>
              <div className="mt-2 flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <p>{ticketType.event.name}</p>
              </div>
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
              <button 
                onClick={fetchTicketType} 
                disabled={isUpdating}
                className="p-2 text-purple-600 rounded-full hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${isUpdating ? 'animate-spin' : ''}`} />
              </button>
              <Input
                type="text"
                placeholder="# of new tickets"
                value={numAddTickets}
                onChange={(e) => setNumAddTickets(e.target.value)}
                style={{ width: "9rem" }}
              />
              <Button onClick={handleAddTickets} type="submit">
                Add new tickets
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            <div className="bg-purple-50 rounded-lg p-5">
              <div className="text-purple-600 text-sm font-medium">Total Tickets</div>
              <div className="text-2xl font-bold mt-1">{totalTickets}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-5">
              <div className="text-green-600 text-sm font-medium">Sold</div>
              <div className="text-2xl font-bold mt-1">{soldTickets}</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-5">
              <div className="text-blue-600 text-sm font-medium">Available</div>
              <div className="text-2xl font-bold mt-1">{availableTickets}</div>
            </div>
            
            <div className="bg-zinc-200 rounded-lg p-5">
              <div className="text-zinc-900 text-sm font-medium">Waitlist</div>
              <div className="text-2xl font-bold mt-1">{waitlistTickets}</div>
            </div>

            <div className="bg-amber-50 rounded-lg p-5">
              <div className="text-amber-600 text-sm font-medium">Checked In</div>
              <div className="text-2xl font-bold mt-1">{checkedInTickets}</div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-semibold flex items-center">
            <BarChart4 className="h-5 w-5 text-purple-600 mr-2" />
            Ticket Details
          </h2>
          
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code or customer"
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
        
        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No tickets matching your search criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket Code
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purchase Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket: any) => {
                    const purchased = !!ticket.purchasedTicket;
                    const purchaser = purchased ? ticket.purchasedTicket.user.name : 'N/A';
                    const purchaseTime = purchased
                      ? new Date(ticket.purchasedTicket.createdAt).toLocaleString()
                      : 'N/A';
                    const waitlisted = ticket.waitedlisted;
                    const waitlister = waitlisted ? ticket.waitlistedTicket.user.name : 'N/A';
                    const waitlisteTime = waitlisted
                      ? new Date(ticket.waitlistedTicket.createdAt).toLocaleString()
                      : 'N/A';
                    return (
                      <tr key={ticket.code} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Ticket className="h-4 w-4 text-purple-500 mr-2" />
                            <span className="font-medium">{ticket.code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {purchased ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Sold
                            </span>
                          ) : ticket.waitlisted ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-zinc-200 text-zinc-900">
                            Waitlist
                          </span>
                          ): (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{waitlisted ? waitlister : (purchased ? purchaser : 'N/A')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{waitlisted ? waitlisteTime : (purchased ? purchaseTime : 'N/A')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {ticket.checkedIn ? (
                            <div className="flex items-center text-green-600">
                              <Check className="h-4 w-4 mr-1" />
                              <span>Checked In</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <X className="h-4 w-4 mr-1" />
                              <span>Not Checked In</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}