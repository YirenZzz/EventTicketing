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

  /* ─────────── UI ─────────── */
  if (loading) return <p className="p-8 text-center">Loading …</p>;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Receipt className="w-6 h-6" />
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="border-dashed border-2 rounded-lg p-10 text-center text-gray-500">
            <Ticket className="w-10 h-10 mx-auto mb-4" />
            You haven’t purchased any tickets yet.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => (
              <div
                key={o.purchaseId}
                className="border rounded-lg p-4 flex justify-between items-center"
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
                      Checked In
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-blue-600 text-sm font-medium">
                      <XCircle className="w-4 h-4 mr-1" />
                      Valid
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}