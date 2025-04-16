// src/app/dashboard/organizer/[userId]/events/[eventId]/page.tsx
import { notFound } from 'next/navigation';
import TicketManager from '@/components/ticket/TicketManager';
import AppShell from '@/components/layout/AppShell';

export default async function EventDetailPage({
  params,
}: {
  params: { userId: string; eventId: string };
}) {
  const { userId, eventId } = params;

  // 获取 Event 信息
  const eventRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/organizers/${userId}/events/${eventId}`,
    { cache: 'no-store' }
  );
  if (!eventRes.ok) return notFound();
  const { event } = await eventRes.json();

  // 获取该 Event 下所有 TicketType
  const ticketTypeRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/organizers/${userId}/events/${eventId}/ticket-types`,
    { cache: 'no-store' }
  );
  if (!ticketTypeRes.ok) return notFound();
  const { ticketTypes } = await ticketTypeRes.json();

  return (
    <AppShell>
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl uppercase text-purple-600 font-semibold">
          {event.name}
        </h1>
        <p className="text-sm font-bold mt-2 mb-4">
          Organizer: {event.organizerName}
        </p>
        <p className="text-gray-700 mb-4">{event.description}</p>
        <p className="text-sm text-gray-500">
          🗓️ {new Date(event.startDate).toLocaleString()} –{' '}
          {new Date(event.endDate).toLocaleString()}
        </p>
      </div>

      <TicketManager eventId={event.id} initialTicketTypes={ticketTypes} />
    </div>
    </AppShell>
  );
}