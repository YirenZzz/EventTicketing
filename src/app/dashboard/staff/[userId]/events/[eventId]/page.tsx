// src/app/dashboard/organizer/[userId]/events/[eventId]/page.tsx
import { notFound } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Progress } from "@/components/ui/progress";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ userId: string; eventId: string }>;
}) {
  const { userId, eventId } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Get Event info
  const eventRes = await fetch(
    `${baseUrl}/api/organizers/${userId}/events/${eventId}`,
    {
      cache: "no-store",
    },
  );
  if (!eventRes.ok) return notFound();
  const { event } = await eventRes.json();

  // Get Ticket Types
  const ticketTypeRes = await fetch(
    `${baseUrl}/api/organizers/${userId}/events/${eventId}/ticket-types`,
    {
      cache: "no-store",
    },
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

          <p className="text-gray-600">
            📍 Location:{" "}
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

          {event.location && (
            <div className="rounded overflow-hidden border shadow w-full h-[300px] mb-6">
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

          <p className="text-sm text-gray-500">
            🗓️ {new Date(event.startDate).toLocaleString()} –{" "}
            {new Date(event.endDate).toLocaleString()}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">🎟️ Ticket Types</h2>
          {ticketTypes.length === 0 ? (
            <p className="text-gray-500">No ticket types available.</p>
          ) : (
            <ul className="space-y-4">
              {ticketTypes.map((tt: any) => {
                const total = tt.quantity;
                const sold = tt.tickets.filter((t: any) => t.purchased).length;
                const checkedIn = tt.tickets.filter(
                  (t: any) => t.checkedIn,
                ).length;
                const percent =
                  sold > 0 ? Math.round((checkedIn / sold) * 100) : 0;

                return (
                  <li key={tt.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <a
                          href={`/dashboard/staff/${userId}/events/${eventId}/tickets_type/${tt.id}`}
                          className="font-semibold text-purple-700 hover:underline"
                        >
                          {tt.name}
                        </a>
                        <p className="text-sm text-gray-600">
                          Price: ${tt.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p>Total: {total}</p>
                        <p>Sold: {sold}</p>
                        <p>Checked-In: {checkedIn}</p>
                      </div>
                    </div>
                    <Progress value={percent} className="mt-2 h-2" />
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
