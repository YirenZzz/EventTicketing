'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import {
  Receipt,
  Ticket,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import SearchBackHeader from '@/components/layout/SearchBackHeader';

interface OrderItem {
  purchaseId: number;
  purchasedAt: string;
  eventId: number;
  eventName: string;
  ticketTypeName: string;
  price: number;
  checkedIn: boolean;
  ticketId: number;
}

export default function AttendeeOrdersPage() {
  const { userId } = useParams() as { userId: string };
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search function
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  /* ─────────── Fetch attendee orders ─────────── */
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/attendees/${userId}/purchased`);
      if (!res.ok) { setLoading(false); return; }
      const { data } = await res.json();
      setOrders(data);
      setLoading(false);
    })();
  }, [userId]);

  // Filter orders based on search query
  const filteredOrders = searchQuery.trim()
    ? orders.filter(order => {
        const query = searchQuery.toLowerCase();
        return (
          // Search by event name
          order.eventName.toLowerCase().includes(query) ||
          // Search by ticket type
          order.ticketTypeName.toLowerCase().includes(query) ||
          // Search by price
          order.price.toString().includes(query) ||
          // Search by check-in status
          (order.checkedIn && "checked in".includes(query)) ||
          (!order.checkedIn && ("valid".includes(query) || "not checked in".includes(query))) ||
          // Search by purchase date
          format(new Date(order.purchasedAt), 'PPpp').toLowerCase().includes(query)
        );
      })
    : orders;

  /* ─────────── UI ─────────── */
  if (loading) {
    return (
      <AppShell>
        <SearchBackHeader
          searchPlaceholder="Search orders by event, ticket type..."
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

  return (
    <AppShell>
      <SearchBackHeader
        searchPlaceholder="Search orders by event, ticket type..."
        onSearchChange={handleSearch}
        searchValue={searchQuery}
        showBackButton={true}
        backUrl={`/dashboard/attendee/${userId}`}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header with search results count */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            My Orders
          </h1>
          
          {searchQuery.trim() && (
            <p className="text-sm text-gray-600">
              {filteredOrders.length === 0 ? 
                "No orders found" :
                `Found ${filteredOrders.length} ${filteredOrders.length === 1 ? 'order' : 'orders'}`
              }
            </p>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="border-dashed border-2 rounded-lg p-10 text-center text-gray-500">
            <Ticket className="w-10 h-10 mx-auto mb-4" />
            You haven't purchased any tickets yet.
          </div>
        ) : filteredOrders.length === 0 && searchQuery.trim() ? (
          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-2">No orders found matching "{searchQuery}"</p>
            <p className="text-sm text-gray-500">
              Try adjusting your search terms or clear the search to see all orders.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(o => {
              // Check if this order matches the search query specifically by event name or ticket type
              // for highlighting purposes
              const isHighlighted = searchQuery.trim() && (
                o.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.ticketTypeName.toLowerCase().includes(searchQuery.toLowerCase())
              );
              
              return (
                <div
                  key={o.purchaseId}
                  className={`border rounded-lg p-4 flex justify-between items-center transition-all ${
                    isHighlighted ? 'border-purple-300 bg-purple-50 shadow-sm' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-medium">{o.eventName}</div>
                    <div className="text-sm text-gray-600">
                      {o.ticketTypeName} ・ ${o.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Purchased&nbsp;
                      {format(new Date(o.purchasedAt), 'PPpp')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.checkedIn ? (
                      <span className="inline-flex items-center text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Checked In
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-blue-600 text-sm font-medium">
                        <XCircle className="w-4 h-4 mr-1" />
                        Valid
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}