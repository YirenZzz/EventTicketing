'use client';

export function TicketCard({ ticket }: { ticket: any }) {
  return (
    <div className="p-4 rounded border shadow-sm bg-white">
      <h4 className="text-lg font-bold">{ticket.code}</h4>
      <p>Type: {ticket.type}</p>
      <p>Price: ${ticket.price}</p>
      <p>Status: {ticket.status}</p>
    </div>
  );
}