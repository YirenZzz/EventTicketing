'use client';

import { useEffect, useState } from 'react';

export default function TicketSection({ eventId }: { eventId: number }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    fetch(`/api/events/${eventId}/tickets`)
      .then((res) => res.json())
      .then((data) => setTickets(data.tickets));
  }, [eventId]);

  const handleCreate = async () => {
    await fetch(`/api/events/${eventId}/tickets`, {
      method: 'POST',
      body: JSON.stringify({ name, price: parseFloat(price), quantity: parseInt(quantity) }),
      headers: { 'Content-Type': 'application/json' },
    });

    // 刷新列表
    const res = await fetch(`/api/events/${eventId}/tickets`);
    const data = await res.json();
    setTickets(data.tickets);
    setName('');
    setPrice('');
    setQuantity('');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">🎟️ Ticketing</h2>

      <div className="space-y-2 mb-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="border p-3 rounded bg-white flex justify-between">
            <div>
              <div className="font-medium">{ticket.name}</div>
              <div className="text-sm text-gray-500">CA${ticket.price} · {ticket.sold}/{ticket.quantity} sold</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-purple-50 p-4 rounded space-y-2">
        <h3 className="font-semibold">Create new ticket</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" className="w-full p-2 border rounded" />
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" className="w-full p-2 border rounded" />
        <button onClick={handleCreate} className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded">
          Create Ticket
        </button>
      </div>
    </div>
  );
}