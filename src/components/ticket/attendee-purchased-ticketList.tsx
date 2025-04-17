"use client";
import { useEffect, useState } from "react";
import TicketQRCode from "@/components/TicketQRCode";

interface PurchasedTicketListProps {
  userId: number;
  searchQuery?: string; // Make it optional for backward compatibility
}

export default function PurchasedTicketList({ 
  userId, 
  searchQuery = '' 
}: PurchasedTicketListProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchTickets() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/attendees/${userId}/purchased`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load tickets");
        setTickets(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTickets();
  }, [userId]);

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery?.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      // Search by event name
      (ticket.eventName?.toLowerCase().includes(query)) || 
      // Search by ticket type
      (ticket.ticketTypeName?.toLowerCase().includes(query)) || 
      // Search by ticket code
      (String(ticket.code)?.toLowerCase().includes(query)) ||
      // Search by check-in status
      (ticket.checkedIn && "checked in".includes(query)) ||
      (!ticket.checkedIn && "not checked in".includes(query)) ||
      // Search by purchase date
      (new Date(ticket.purchasedAt).toLocaleString().toLowerCase().includes(query))
    );
  });

  if (isLoading) return <p>Loading tickets...</p>;
  if (error) return <p className="text-red-500">❌ {error}</p>;
  if (tickets.length === 0) return <p>No purchased tickets yet.</p>;
  
  // Show message when search yields no results
  if (filteredTickets.length === 0 && searchQuery?.trim()) {
    return (
      <div className="space-y-4 mt-6">
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
          <p className="text-center">No tickets found matching "{searchQuery}".</p>
          <p className="text-center text-sm text-gray-500 mt-2">
            Try adjusting your search terms or clear the search box to see all tickets.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Show search results count when searching */}
      {searchQuery?.trim() && (
        <p className="text-sm text-gray-500 mb-4">
          Found {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'} matching "{searchQuery}"
        </p>
      )}
      
      {filteredTickets.map((ticket) => (
        <div
          key={ticket.ticketId}
          className="border p-4 rounded shadow bg-white hover:shadow-md transition"
        >
          <h2 className="text-lg font-bold mb-1">{ticket.eventName}</h2>
          <p className="text-sm text-gray-600 mb-1">
            🎟️ Ticket:{" "}
            <span className="font-medium">{ticket.ticketTypeName}</span>
          </p>
          <p className="text-sm text-gray-600 mb-1">
            ✅ Check-in: {ticket.checkedIn ? "Yes" : "No"}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            🕓 Purchased At: {new Date(ticket.purchasedAt).toLocaleString()}
          </p>
          <div className="flex flex-col items-center">
            <TicketQRCode value={ticket.code} />
          </div>
        </div>
      ))}
    </div>
  );
}