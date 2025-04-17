// src/app/dashboard/organizer/[userId]/events/[eventId]/tickets_type/[ticketTypeId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import io from 'socket.io-client';
import AppShell from '@/components/layout/AppShell';

let socket: ReturnType<typeof io> | null = null;

export default function TicketTypeLivePage() {
  const { userId, eventId, ticketTypeId } = useParams() as {
    userId: string;
    eventId: string;
    ticketTypeId: string;
  };

  const [ticketType, setTicketType] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTicketType = async () => {
    const res = await fetch(
      `/api/organizers/${userId}/events/${eventId}/ticket-types/${ticketTypeId}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return;
    const { ticketType } = await res.json();
    setTicketType(ticketType);
    setLoading(false);
  };

  useEffect(() => {
    fetchTicketType();
  }, [userId, eventId, ticketTypeId]);

  // 监听 ticketPurchased 事件
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

  if (loading || !ticketType) return <p className="p-8 text-center">Loading…</p>;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Ticket Type: {ticketType.name}</h1>
          <p className="text-gray-600">Event: {ticketType.event.name}</p>
          <p className="text-gray-500">Total: {ticketType.quantity}</p>
        </header>

        <ul className="space-y-2">
          {ticketType.tickets.map((t: any) => {
            const purchased = !!t.purchasedTicket;
            const purchaser = purchased ? t.purchasedTicket.user.name : 'N/A';
            const purchaseTime = purchased
              ? new Date(t.purchasedTicket.createdAt).toLocaleString()
              : 'N/A';
            const checkedIn = t.checkedIn ? '✅ Yes' : '❌ No';

            return (
              <li
                key={t.code}
                className="border px-4 py-2 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">🎟️ Ticket Code: {t.code}</p>
                  <p className="text-sm">Purchased: {purchased ? '✅ Yes' : '❌ No'}</p>
                  <p className="text-sm">User: {purchaser}</p>
                  <p className="text-sm">Purchase Time: {purchaseTime}</p>
                  <p className="text-sm">Check-in: {checkedIn}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}