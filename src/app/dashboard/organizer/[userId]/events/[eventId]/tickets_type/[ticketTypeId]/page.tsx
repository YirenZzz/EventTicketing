// src/app/dashboard/organizer/[userId]/events/[eventId]/tickets_type/[ticketTypeId]/page.tsx
import { notFound } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';

export default async function TicketTypePage({
  params,
}: {
  params: Promise<{ userId: string; eventId: string; ticketTypeId: string }>;
}) {
  const { userId, eventId, ticketTypeId } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/organizers/${userId}/events/${eventId}/ticket-types/${ticketTypeId}`,
    { cache: 'no-store' }
  );

  if (!res.ok) return notFound();

  const { ticketType } = await res.json();

  return (
    <AppShell>
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ticket Type: {ticketType.name}</h1>
        <p className="text-gray-600">Event: {ticketType.event.name}</p>
        <p className="text-gray-500">Total: {ticketType.quantity}</p>
      </div>

      <div className="mt-6 space-y-3">
        {ticketType.tickets.length === 0 ? (
          <p>No tickets generated.</p>
        ) : (
          <ul className="space-y-2">
            {ticketType.tickets.map((ticket: any) => {
              const purchased = !!ticket.PurchasedTicket;
              const purchaser = purchased ? ticket.PurchasedTicket.user.name : 'N/A';
              const purchaseTime = purchased ? new Date(ticket.PurchasedTicket.createdAt).toLocaleString() : 'N/A';
              const checkedIn = ticket.checkedIn ? '✅ Yes' : '❌ No';

              return (
                <li
                  key={ticket.id}
                  className="border px-4 py-2 rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">🎟️ Ticket ID: {ticket.id}</p>
                    <p className="text-sm">Purchased: {purchased ? '✅ Yes' : '❌ No'}</p>
                    <p className="text-sm">User: {purchaser}</p>
                    <p className="text-sm">Purchase Time: {purchaseTime}</p>
                    <p className="text-sm">Check-in: {checkedIn}</p>
                  </div>
                </li>
                
              );
            })}
          </ul>
        )}
      </div>
    </div>
    </AppShell>
  );
}