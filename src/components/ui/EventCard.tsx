// components/ui/EventCard.tsx
'use client';

import Link from 'next/link';
import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import EditEventModal from '../modals/EditEventModal';

interface EventCardProps {
  event: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    coverImage?: string | null;
  };
  href?: string;
  showActions?: boolean;
}

export const EventCard = ({ event, href, showActions = true }: EventCardProps) => {
  const [openEdit, setOpenEdit] = useState(false);
  const { data: session } = useSession();

  const handleDelete = async () => {
    if (!confirm('Delete this event?')) return;
    const organizerId = session?.user?.id;
    if (!organizerId) return alert('Not logged in');
    const res = await fetch(`/api/organizers/${organizerId}/events/${event.id}`, { method: 'DELETE' });
    if (res.ok) window.location.reload();
    else alert('Delete failed');
  };

  // 如果没有封面就用随机图
  const coverImage =
    event.coverImage?.trim() ||
    `https://source.unsplash.com/random/400x200?sig=${event.id}`;

  return (
    <div className="p-0 rounded overflow-hidden border shadow-sm bg-white">
      {/* 1) 用原生 <img> */}
      <img
        src={coverImage}
        alt="Event cover"
        className="w-full h-48 object-cover"
        onError={(e) => {
          // 出错时再 fallback 到另一个 placeholder
          (e.currentTarget as HTMLImageElement).src =
            'https://picsum.photos/400/200?random=' + event.id;
        }}
      />

      <div className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <Link href={href || `/dashboard/organizer/${session?.user?.id}/events/${event.id}`}>
            <h3 className="text-lg font-semibold text-gray-800 hover:underline cursor-pointer">
              {event.name}
            </h3>
          </Link>
          {showActions && (
            <div className="flex gap-2">
              <button onClick={() => setOpenEdit(true)}>
                <Pencil className="w-4 h-4 text-gray-600 hover:text-purple-700" />
              </button>
              <button onClick={handleDelete}>
                <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center text-sm text-gray-600 gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          {new Date(event.startDate).toLocaleString()} –{' '}
          {new Date(event.endDate).toLocaleString()}
        </div>

        <span className="inline-block text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">
          {event.status}
        </span>

        {showActions && (
          <EditEventModal
            open={openEdit}
            onClose={() => setOpenEdit(false)}
            event={{ ...event, organizerId: session?.user?.id }}
          />
        )}
      </div>
    </div>
  );
};