'use client';

import { Calendar } from 'lucide-react';
import TicketModule from '@/components/events/TicketModule';

export default function EventDetailClient({ event }: { event: any }) {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <p className="text-sm uppercase text-purple-600 font-semibold">{event.organizerName}</p>

      <h1 className="text-3xl font-bold mt-2 mb-4 hover:underline">
        {event.name}
      </h1>

      <p className="text-gray-700 mb-4">{event.description}</p>

      <div className="flex items-center text-sm text-gray-500 gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span>
          {new Date(event.startDate).toLocaleString()} –{' '}
          {new Date(event.endDate).toLocaleString()}
        </span>
      </div>
      <TicketModule eventId={event.id.toString()} />
    </div>
  );
}