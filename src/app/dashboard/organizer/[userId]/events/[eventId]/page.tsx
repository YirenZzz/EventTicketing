// src/app/dashboard/organizer/[userId]/events/[eventId]/page.tsx
import { notFound } from "next/navigation";
import TicketManager from "@/components/ticket/TicketManager";
import AppShell from "@/components/layout/AppShell";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ userId: string; eventId: string }>;
}) {
  const { userId, eventId } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const [eventRes, ticketTypeRes, purchasedTicketRes] = await Promise.all([
    fetch(`${baseUrl}/api/organizers/${userId}/events/${eventId}`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/organizers/${userId}/events/${eventId}/ticket-types`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/organizers/${userId}/events/${eventId}/purchased-tickets`, { cache: "no-store" }),
  ]);

  if (!eventRes.ok || !ticketTypeRes.ok || !purchasedTicketRes.ok) return notFound();

  const { event } = await eventRes.json();
  const { ticketTypes } = await ticketTypeRes.json();
  const { purchasedTickets } = await purchasedTicketRes.json();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
        {/* Event Information Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <h1 className="text-3xl font-bold text-purple-700">{event.name}</h1>

          <p className="text-sm font-semibold text-gray-500">
            Organizer: <span className="text-gray-800">{event.organizerName}</span>
          </p>

          <p className="text-gray-700 whitespace-pre-line">{event.description}</p>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              🕒 <strong>Time:</strong>{" "}
              {new Date(event.startDate).toLocaleString()} –{" "}
              {new Date(event.endDate).toLocaleString()}
            </p>

            <p>
              📍 <strong>Location:</strong>{" "}
              {event.location ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 underline hover:text-blue-800 transition"
                >
                  {event.location}
                </a>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </p>
          </div>

          {event.location && (
            <div className="rounded overflow-hidden border shadow w-full h-[280px]">
              <iframe
                title="Google Map"
                width="100%"
                height="100%"
                loading="lazy"
                allowFullScreen
                className="border-0"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAjOPLPLqCYJ35aCRywwJzi52h2aY0rKTg&q=${encodeURIComponent(event.location)}`}
              ></iframe>
            </div>
          )}
        </div>

        {/* Ticket Management Section */}
        <TicketManager
          eventId={event.id}
          initialTicketTypes={ticketTypes}
          purchasedTickets={purchasedTickets}
        />
      </div>
    </AppShell>
  );
}