// src/app/dashboard/attendee/[userId]/activity/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import SearchBackHeader from '@/components/layout/SearchBackHeader';

interface Purchase {
  purchaseId: number;
  purchasedAt: string;
  eventId: number;
  eventName: string;
  eventStart: string;
  eventEnd: string;
  ticketTypeName: string;
  checkedIn: boolean;
}

export default function AttendeeActivityPage() {
  const { userId } = useParams() as { userId: string };
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Handle search function
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // If there's a search query, expand all events to show matching tickets
    if (query.trim()) {
      // Get all event IDs and expand them
      const allEventIds = Array.from(new Set(purchases.map(p => p.eventId)));
      setExpanded(new Set(allEventIds));
    }
  };

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/attendees/${userId}/purchased`, { cache: 'no-store' });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const { data } = await res.json();
      setPurchases(data);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return (
      <AppShell>
        <SearchBackHeader
          searchPlaceholder="Search events and tickets..."
          onSearchChange={handleSearch}
          searchValue={searchQuery}
          showBackButton={true}
          backUrl={`/dashboard/attendee/${userId}`}
        />
        <div className="flex justify-center p-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-700 border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (purchases.length === 0) {
    return (
      <AppShell>
        <SearchBackHeader
          searchPlaceholder="Search events and tickets..."
          onSearchChange={handleSearch}
          searchValue={searchQuery}
          showBackButton={true}
          backUrl={`/dashboard/attendee/${userId}`}
        />
        <div className="max-w-3xl mx-auto p-8 text-center text-gray-500">
          You haven't purchased any tickets yet.
        </div>
      </AppShell>
    );
  }

  // Filter purchases based on search query
  const filteredPurchases = searchQuery.trim() 
    ? purchases.filter(purchase => {
        const query = searchQuery.toLowerCase();
        return (
          // Search by event name
          purchase.eventName.toLowerCase().includes(query) ||
          // Search by ticket type
          purchase.ticketTypeName.toLowerCase().includes(query) ||
          // Search by check-in status
          (purchase.checkedIn && "checked in".includes(query)) ||
          (!purchase.checkedIn && "not checked in".includes(query)) ||
          // Search by purchase date
          new Date(purchase.purchasedAt).toLocaleString().toLowerCase().includes(query)
        );
      })
    : purchases;

  // 1. Group by event
  const eventsMap = new Map<
    number,
    { name: string; start: string; end: string; purchases: Purchase[] }
  >();
  
  filteredPurchases.forEach((p) => {
    const grp = eventsMap.get(p.eventId);
    if (grp) {
      grp.purchases.push(p);
    } else {
      eventsMap.set(p.eventId, {
        name: p.eventName,
        start: p.eventStart,
        end: p.eventEnd,
        purchases: [p],
      });
    }
  });

  // 2. Only future events, sorted by start ascending
  const now = Date.now();
  const upcomingEvents = Array.from(eventsMap.entries())
    .map(([eventId, { name, start, end, purchases }]) => ({
      eventId,
      name,
      start,
      end,
      purchases,
    }))
    .filter(({ start }) => new Date(start).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.start).getTime() - new Date(b.start).getTime()
    );

  return (
    <AppShell>
      <SearchBackHeader
        searchPlaceholder="Search events and tickets..."
        onSearchChange={handleSearch}
        searchValue={searchQuery}
        showBackButton={true}
        backUrl={`/dashboard/attendee/${userId}`}
      />
      
      <div className="max-w-3xl mx-auto p-8 space-y-4">
        <h1 className="text-2xl font-bold">Your Upcoming Events</h1>
        
        {/* Search results feedback */}
        {searchQuery.trim() && (
          <div className="text-sm text-gray-600 mb-4">
            {upcomingEvents.length === 0 ? (
              <p>No events or tickets found matching "{searchQuery}"</p>
            ) : (
              <p>
                Found {upcomingEvents.length} {upcomingEvents.length === 1 ? 'event' : 'events'} 
                matching "{searchQuery}"
              </p>
            )}
          </div>
        )}

        {upcomingEvents.length === 0 && searchQuery.trim() ? (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md text-center">
            <p>No upcoming events found matching your search.</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search terms or clear the search box to see all events.
            </p>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="p-4 border border-gray-200 rounded-md text-center">
            <p>You don't have any upcoming events.</p>
          </div>
        ) : (
          upcomingEvents.map(({ eventId, name, start, end, purchases }) => {
            const isOpen = expanded.has(eventId);
            
            // Calculate if this event has purchases that match the search
            const hasMatchingPurchases = searchQuery.trim() && purchases.some(purchase => {
              const query = searchQuery.toLowerCase();
              return (
                purchase.ticketTypeName.toLowerCase().includes(query) ||
                (purchase.checkedIn && "checked in".includes(query)) ||
                (!purchase.checkedIn && "not checked in".includes(query))
              );
            });
            
            return (
              <div key={eventId} className={`border rounded-lg overflow-hidden ${
                hasMatchingPurchases ? 'border-purple-300 shadow-md' : ''
              }`}>
                <button
                  onClick={() => {
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      next.has(eventId) ? next.delete(eventId) : next.add(eventId);
                      return next;
                    });
                  }}
                  className={`w-full flex justify-between items-center px-4 py-2 transition ${
                    hasMatchingPurchases 
                      ? 'bg-purple-50 hover:bg-purple-100' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(start).toLocaleString()} &ndash;{' '}
                      {new Date(end).toLocaleString()}
                    </div>
                  </div>
                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </button>

                {isOpen && (
                  <ul className="divide-y">
                    {purchases.map((p) => {
                      // Highlight matching ticket
                      const isHighlighted = searchQuery.trim() && (
                        p.ticketTypeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.checkedIn && "checked in".includes(searchQuery.toLowerCase())) ||
                        (!p.checkedIn && "not checked in".includes(searchQuery.toLowerCase()))
                      );
                      
                      return (
                        <li
                          key={p.purchaseId}
                          className={`px-4 py-3 flex justify-between ${
                            isHighlighted ? 'bg-purple-50' : ''
                          }`}
                        >
                          <div>
                            <div className="font-medium">{p.ticketTypeName}</div>
                            <div className="text-sm text-gray-500">
                              Purchased: {new Date(p.purchasedAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-sm">
                            {p.checkedIn ? '✅ Checked‑In' : '❌ Not Checked‑In'}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}