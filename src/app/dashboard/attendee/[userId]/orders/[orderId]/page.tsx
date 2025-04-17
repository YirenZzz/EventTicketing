import { use } from "react";
import { notFound } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import TicketQRCode from "@/components/TicketQRCode";

export default async function OrderDetailPage({
  params,
}: {
  params: { userId: string; orderId: string };
}) {
  const { userId, orderId } = params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/attendees/${userId}/purchased`,
  );
  if (!res.ok) return notFound();
  const { data } = await res.json();

  const ticket = data.find((p: any) => p.purchaseId === Number(orderId));
  if (!ticket) return notFound();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-8 space-y-4">
        <h1 className="text-2xl font-bold">{ticket.eventName}</h1>
        <p>🎟️ Ticket Type: {ticket.ticketTypeName}</p>
        <p>✅ Checked In: {ticket.checkedIn ? "Yes" : "No"}</p>
        <p>🕓 Purchased At: {new Date(ticket.purchasedAt).toLocaleString()}</p>

        <div className="flex flex-col items-center mt-6">
          <TicketQRCode value={ticket.code} />
        </div>
      </div>
    </AppShell>
  );
}
