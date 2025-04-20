"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TicketQRCode from "@/components/TicketQRCode";

export default function TicketPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;

  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/tickets/${ticketId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load ticket");
        setTicketCode(data.ticket.code);
      } catch (err: any) {
        setError(err.message);
      }
    }

    fetchTicket();
  }, [ticketId]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Your Ticket QR Code</h1>
      {error && <p className="text-red-500">❌ {error}</p>}
      {ticketCode ? <TicketQRCode value={ticketCode} /> : <p>Loading...</p>}
    </div>
  );
}
