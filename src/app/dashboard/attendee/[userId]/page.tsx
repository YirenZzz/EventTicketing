'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AppShell from '@/components/layout/AppShell';
import PurchasedTicketList from "@/components/ticket/attendee-purchased-ticketList";
import SearchBackHeader from '@/components/layout/SearchBackHeader';

export default function AttendeeDashboardPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  // Unwrap the Promise using React.use()
  const unwrappedParams = use(params);
  const { userId } = unwrappedParams;
  const numericId = Number(userId);
  
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalEvents: 0,
    upcomingEvents: 0,
  });

  // Handle search function - this will be passed to the SearchBackHeader
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // This search query will be passed to PurchasedTicketList via props
  };

  // Fetch purchased tickets and compute stats
  useEffect(() => {
    if (status !== 'authenticated') return;

    (async () => {
      const res = await fetch(`/api/attendees/${userId}/purchased`);
      if (!res.ok) return;
      const { data } = await res.json();

      const totalTickets = data.length;

      // collect unique events + their start times
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

  return (
    <AppShell>
      {/* Search header at the top */}
      <SearchBackHeader
        searchPlaceholder="Search your tickets and events..."
        onSearchChange={handleSearch}
        searchValue={searchQuery}
        showBackButton={true}
      />

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
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-2">Your Events</h2>
            <p className="text-3xl font-bold">{stats.totalEvents}</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.totalEvents
                ? `${stats.totalEvents} event${stats.totalEvents > 1 ? 's' : ''}`
                : 'No events registered yet'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-2">Tickets</h2>
            <p className="text-3xl font-bold">{stats.totalTickets}</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.totalTickets
                ? `${stats.totalTickets} ticket${stats.totalTickets > 1 ? 's' : ''}`
                : 'No tickets purchased yet'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-2">Upcoming Events</h2>
            <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.upcomingEvents
                ? `${stats.upcomingEvents} upcoming`
                : 'No upcoming events'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="p-4 border border-purple-200 rounded-md hover:bg-purple-50 flex items-center"
              onClick={() =>
                window.location.href = `/dashboard/attendee/${userId}/activity`
              }
            >
              {/* icon omitted for brevity */}
              <div className="text-left">
                <h3 className="font-medium">My Activity</h3>
                <p className="text-sm text-gray-500">
                  See your purchased events & tickets
                </p>
              </div>
            </button>

            <button
              className="p-4 border border-purple-200 rounded-md hover:bg-purple-50 flex items-center"
              onClick={() => window.location.href = `/dashboard/attendee/${userId}/events`}
            >
              {/* icon omitted for brevity */}
              <div className="text-left">
                <h3 className="font-medium">Browse Events</h3>
                <p className="text-sm text-gray-500">
                  Find upcoming events to attend
                </p>
              </div>
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Your Purchased Tickets</h2>
          {/* Pass the searchQuery to PurchasedTicketList */}
          <PurchasedTicketList 
            userId={numericId} 
            searchQuery={searchQuery} 
          />
        </div>
      </div>
    </AppShell>
  );
}