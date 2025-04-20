"use client";

import { Calendar } from "lucide-react";
import TicketModule from "@/components/events/TicketModule";

export default function EventDetailClient({ event }: { event: any }) {
  console.log("event data →", event);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <p className="text-sm uppercase text-purple-600 font-semibold">
        {event.organizerName}
      </p>

      <h1 className="text-3xl font-bold mt-2 mb-4 hover:underline">
        {event.name}
      </h1>
      <p className="text-gray-700 mb-4">{event.description}</p>

      {event.location ? (
        <p className="text-gray-700 mb-4 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-red-500 shrink-0" />
          <button
            type="button"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  event.location,
                )}`,
                "_blank",
                "noopener,noreferrer",
              )
            }
            className="text-blue-600 underline hover:text-blue-800 focus:outline-none"
          >
            {event.location}
          </button>
        </p>
      ) : (
        <p className="text-gray-500 italic mb-4">Location not provided</p>
      )}

      {event.location && (
        <div className="w-full h-64 rounded-md overflow-hidden mb-6 border">
          <iframe
            title="Event location map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              event.location,
            )}&output=embed`}
          />
        </div>
      )}

      <div className="flex items-center text-sm text-gray-500 gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span>
          {new Date(event.startDate).toLocaleString()} –{" "}
          {new Date(event.endDate).toLocaleString()}
        </span>
      </div>
      <TicketModule eventId={event.id.toString()} />
    </div>
  );
}
