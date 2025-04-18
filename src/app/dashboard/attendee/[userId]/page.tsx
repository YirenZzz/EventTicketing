'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Search as SearchIcon,
  CheckCircle,
  XCircle,
  Ticket,
} from 'lucide-react';

export default function AttendeeDashboardPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const numericId = Number(userId);
  const { data: session, status } = useSession();

  const [stats, setStats] = useState({
    totalTickets: 0,
    totalEvents: 0,
    upcomingEvents: 0,
  });

  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [search, setSearch] = useState('');

  // Fetch stats + tickets
  useEffect(() => {
    if (status !== 'authenticated') return;

    (async () => {
      const res = await fetch(`/api/attendees/${userId}/purchased`, {
        cache: 'no-store',
      });
      if (!res.ok) return;

      const { data } = await res.json();
      setTickets(data);
      setLoadingTickets(false);

      const totalTickets = data.length;
      const eventStarts = new Map<number, string>();
      data.forEach((p: any) => {
        if (!eventStarts.has(p.eventId)) {
          eventStarts.set(p.eventId, p.eventStart);
        }
      });

      const totalEvents = eventStarts.size;
      const now = Date.now();
      const upcomingEvents = Array.from(eventStarts.values()).filter(
        (start) => new Date(start).getTime() > now
      ).length;

      setStats({ totalTickets, totalEvents, upcomingEvents });
    })();
  }, [status, userId]);

  if (status === 'loading') {
    return (
      <AppShell>
        <div className="flex justify-center p-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-700 border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  const filtered = tickets.filter((t) => {
    const kw = search.trim().toLowerCase();
    return (
      t.eventName.toLowerCase().includes(kw) ||
      t.ticketTypeName.toLowerCase().includes(kw)
    );
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold">Attendee Dashboard</h1>
          <p className="text-gray-500">
            Welcome back, {session?.user?.name ?? 'User'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Your Events', value: stats.totalEvents },
            { label: 'Tickets', value: stats.totalTickets },
            { label: 'Upcoming Events', value: stats.upcomingEvents },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white p-6 rounded-lg shadow text-center"
            >
              <h2 className="text-lg font-medium mb-2">{label}</h2>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-gray-500 mt-2">
                {value === 0
                  ? `No ${label.toLowerCase()} yet`
                  : `${value} ${label.toLowerCase()}`}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="p-4 border border-purple-200 rounded-md hover:bg-purple-50 flex items-center"
              onClick={() =>
                (window.location.href = `/dashboard/attendee/${userId}/activity`)
              }
            >
              <div className="text-left">
                <h3 className="font-medium">My Activity</h3>
                <p className="text-sm text-gray-500">
                  See your purchased events & tickets
                </p>
              </div>
            </button>

            <button
              className="p-4 border border-purple-200 rounded-md hover:bg-purple-50 flex items-center"
              onClick={() =>
                (window.location.href = `/dashboard/attendee/${userId}/events`)
              }
            >
              <div className="text-left">
                <h3 className="font-medium">Browse Events</h3>
                <p className="text-sm text-gray-500">
                  Find upcoming events to attend
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Tickets */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Your Purchased Tickets</h2>

          {/* 搜索框 */}
          <div className="relative max-w-sm mb-6">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets"
              className="w-full pl-10 py-2 border rounded-md focus:outline-none focus:ring focus:border-purple-400"
            />
          </div>

          {loadingTickets ? (
            <p className="text-gray-500 text-center">Loading tickets…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <Ticket className="w-8 h-8 mx-auto mb-2" />
              No tickets found.
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
            {filtered.map((t) => (
              <Link
                key={t.purchaseId}
                href={`/dashboard/attendee/${userId}/orders/${t.purchaseId}`}
                className="block bg-white shadow-sm hover:shadow-md rounded-lg border p-4 transition"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  {/* 左侧：票务信息 */}
                  <div>
                    <h3 className="text-lg font-semibold">{t.eventName}</h3>
                    <p className="text-sm text-gray-500">{t.ticketTypeName}</p>
                    <p className="text-sm text-gray-600">
                      Purchased {format(new Date(t.purchasedAt), 'PPpp')}
                    </p>
                  </div>
          
                  {/* 中间：价格 */}
                  <div className="text-purple-700 text-xl font-bold whitespace-nowrap">
                    ${t.price.toFixed(2)}
                  </div>
          
                  {/* 右侧：状态 */}
                  <div>
                    <span
                      className={`inline-flex items-center text-sm font-medium rounded-full px-2 py-1 ${
                        t.checkedIn
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {t.checkedIn ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Checked In
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Valid
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}