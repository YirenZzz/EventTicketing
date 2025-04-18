// src/app/dashboard/attendee/[userId]/orders/[orderId]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import TicketQRCode from "@/components/TicketQRCode";

export default async function OrderDetailPage(
  {
    params,        
  }: {
    params: Promise<{ userId: string; orderId: string }>;
  }
) {
 
  const { userId, orderId } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/attendees/${userId}/purchased`
  );
  if (!res.ok) return notFound();
  const { data } = await res.json();

  const ticket = data.find((p: any) => p.purchaseId === Number(orderId));
  if (!ticket) return notFound();

  return (
    <AppShell>
      <div className="max-w-lg mx-auto p-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* 标题区 */}
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-semibold text-gray-800">
              {ticket.eventName}
            </h1>
          </div>

          {/* 内容区 */}
          <div className="px-6 py-6 space-y-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {/* 票种 */}
              <div>
                <dt className="text-sm font-medium text-gray-600">
                  Ticket Type
                </dt>
                <dd className="mt-1 text-gray-800">
                  {ticket.ticketTypeName}
                </dd>
              </div>

              {/* 签到状态 */}
              <div>
                <dt className="text-sm font-medium text-gray-600">
                  Checked In
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      ticket.checkedIn
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {ticket.checkedIn ? "Yes" : "No"}
                  </span>
                </dd>
              </div>

              {/* 购买时间 */}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-600">
                  Purchased At
                </dt>
                <dd className="mt-1 text-gray-800">
                  {new Date(ticket.purchasedAt).toLocaleString()}
                </dd>
              </div>
            </dl>

            {/* 二维码 */}
            <div className="flex justify-center py-4">
              <TicketQRCode value={ticket.code} />
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end">
              <Link
                href={`/dashboard/attendee/${userId}/orders`}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                ← Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}