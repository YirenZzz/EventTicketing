'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Receipt,
  Ticket,
  CheckCircle,
  XCircle,
  Search as SearchIcon,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

// shadcn/ui 组件
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

interface WaitlistItem {
  waitlistId: number;
  waitlistAt: string;
  eventId: number;
  eventName: string;
  ticketTypeName: string;
  price: number;
  purchased: boolean;
  ticketId: number;
  waitlistRank: number;
}

export default function AttendeeOrdersPage() {
  const { userId } = useParams() as { userId: string };
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [waitlists, setWaitlists] = useState<WaitlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      async function getPurchasedOrder() {
        const res = await fetch(`/api/attendees/${userId}/purchased`);
        if (!res.ok) { setLoading(false); return; }
        const { data } = await res.json();
        setOrders(data);
      }
      async function getWaitlistOrder() {
        const res = await fetch(`/api/attendees/${userId}/waitlist`);
        if (!res.ok) { setLoading(false); return; }
        const { data } = await res.json();
        setWaitlists(data);
      }
      await getPurchasedOrder();
      await getWaitlistOrder();
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return (
      <AppShell>
        <p className="p-8 text-center">Loading…</p>
      </AppShell>
    );
  }

  const filteredOrders = orders.filter(o =>
    o.eventName.toLowerCase().includes(search.toLowerCase())
    // o.ticketTypeName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredWaitlists = waitlists.filter(o =>
    o.eventName.toLowerCase().includes(search.toLowerCase())
    // o.ticketTypeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            My Orders
          </h1>
          <div className="relative max-w-sm w-full">
            <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by event"
              className="pl-10"
            />
          </div>
        </div>

        {(filteredOrders.length + filteredWaitlists.length) === 0 ? (
          <div className="border-dashed border-2 rounded-lg p-10 text-center text-gray-500">
            <Ticket className="w-10 h-10 mx-auto mb-4" />
            No orders found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(o => (
              <Card
                key={o.ticketId}
                className="hover:shadow-lg transition cursor-pointer"
              >
                <Link
                  href={`/dashboard/attendee/${userId}/orders/${o.purchaseId}`}
                  className="flex flex-col h-full"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{o.eventName}</CardTitle>
                    <p className="text-sm text-gray-500">{o.ticketTypeName}</p>
                  </CardHeader>

                  <CardContent className="mt-2 flex-grow">
                    <p className="text-sm text-gray-600">
                      Purchased {format(new Date(o.purchasedAt), 'PPpp')}
                    </p>
                    <p className="mt-3 text-xl font-semibold">
                      ${o.price.toFixed(2)}
                    </p>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between">
                    {o.checkedIn ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Checked In
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-blue-600">
                        <XCircle className="mr-1 h-4 w-4" />
                        Valid
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </CardFooter>
                </Link>
              </Card>
            ))}
            {filteredWaitlists.map(o => (
              <Card
                key={o.ticketId}
                className="hover:shadow-lg transition cursor-pointer"
              >
                  <CardHeader>
                    <CardTitle className="text-lg">{o.eventName}</CardTitle>
                    <p className="text-sm text-gray-500">{o.ticketTypeName}</p>
                  </CardHeader>

                  <CardContent className="mt-2 flex-grow">
                    <p className="text-sm text-gray-600">
                      {/* Waitlisted {format(new Date(o.waitlistAt), 'PPpp')} */}
                    </p>
                    <p className="mt-3 text-xl font-semibold">
                      ${o.price.toFixed(2)}
                    </p>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between">
                    <Badge variant="outline" className="text-grey-600">
                      <XCircle className="mr-1 h-4 w-4" />
                      Waitlist
                    </Badge>
                    <Button variant="ghost" size="sm" disabled>
                      Rank: {o.waitlistRank}
                    </Button>
                  </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}