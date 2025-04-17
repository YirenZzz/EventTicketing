"use client";

import { useEffect, useState } from "react";
import TicketQRCode from "@/components/TicketQRCode"; // 你之前写的那个 QR code 组件

export default function PurchasedTicketList({ userId }: { userId: number }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch(`/api/attendees/${userId}/purchased`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load tickets");
        setTickets(data.data);
      } catch (err: any) {
        setError(err.message);
      }
    }

    fetchTickets();
  }, [userId]);

  if (error) return <p className="text-red-500">❌ {error}</p>;

  if (tickets.length === 0) return <p>No purchased tickets yet.</p>;

  return (
    <div className="space-y-4 mt-6">
      {tickets.map((ticket) => (
        <div
          key={ticket.ticketId}
          // key={ticket.code}
          className="border p-4 rounded shadow bg-white hover:shadow-md transition"
        >
          <h2 className="text-lg font-bold mb-1">{ticket.eventName}</h2>
          <p className="text-sm text-gray-600 mb-1">
            🎟️ Ticket:{" "}
            <span className="font-medium">{ticket.ticketTypeName}</span>
          </p>
          <p className="text-sm text-gray-600 mb-1">
            ✅ Check-in: {ticket.checkedIn ? "Yes" : "No"}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            🕓 Purchased At: {new Date(ticket.purchasedAt).toLocaleString()}
          </p>
          <div className="flex flex-col items-center">
            {/* <TicketQRCode value={ticket.ticketId.toString()} /> */}
            <TicketQRCode value={ticket.code} />
          </div>
        </div>
      ))}
    </div>
  );
}
