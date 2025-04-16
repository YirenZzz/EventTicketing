'use client';

import { useEffect, useState } from 'react';
import { TicketCard } from '@/components/ui/TicketCard';
import { Button } from '@/components/ui/button';

export default function TicketModule({ eventId }: { eventId: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tickets?eventId=${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setTickets(data.tickets);
      })
      .catch((err) => {
        console.error('Failed to load tickets', err);
        setError('Failed to load tickets');
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Tickets</h2>
      {loading && <p>Loading tickets...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && tickets.length === 0 && <p>No tickets available.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
      {/* 如果需要，可以增加创建票的按钮 */}
      <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">
        Create New Ticket
      </Button>
    </div>
  );
}