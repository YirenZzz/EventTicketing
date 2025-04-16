'use client';

import Link from 'next/link';
import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import EditEventModal from '../modals/EditEventModal';

export const EventCard = ({ event }: { event: any }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const { data: session } = useSession();

  const handleDelete = async () => {
    const confirm = window.confirm('Are you sure you want to delete this event?');
    if (!confirm) return;

    const organizerId = session?.user?.id;
    if (!organizerId) {
      alert('You must be logged in.');
      return;
    }

    const res = await fetch(
      `/api/organizers/${organizerId}/events/${event.id}`,
      {
        method: 'DELETE',
      }
    );

    if (res.ok) {
      window.location.reload(); // 简单刷新
    } else {
      alert('Failed to delete event');
    }
  };

  const formatEventTimeRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleString()} – ${endDate.toLocaleString()}`;
  };

  return (
    <div className="p-4 rounded border shadow-sm bg-white space-y-2">
      <div className="flex justify-between items-center">
        <Link href={`/dashboard/organizer/${session?.user?.id}/events/${event.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:underline cursor-pointer">
            {event.name}
          </h3>
        </Link>
        <div className="flex gap-2">
          <button onClick={() => setOpenEdit(true)}>
            <Pencil className="w-4 h-4 text-gray-600 hover:text-purple-700" />
          </button>
          <button onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
          </button>
        </div>
      </div>

      <div className="flex items-center text-sm text-gray-600 gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        {formatEventTimeRange(event.startDate, event.endDate)}
      </div>

      <span className="inline-block text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 mt-1">
        {event.status}
      </span>

      <EditEventModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        event={{ ...event, organizerId: session?.user?.id }}
      />
    </div>
  );
};