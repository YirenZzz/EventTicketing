// import TicketQRCode from '@/components/TicketQRCode';

// export default function TicketPage({ params }: { params: { ticketId: string } }) {
//   const ticketCode = params.ticketId; // 或者从后端 fetch 获取更具体 ticketCode

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-semibold mb-4">Your Ticket QR Code</h1>
//       <TicketQRCode value={ticketCode} />
//     </div>
//   );
// }
//
//
//
//
//
//
//
// "use client";

// import { useEffect, useState } from "react";
// import TicketQRCode from "@/components/TicketQRCode";

// export default function TicketPage({
//   params,
// }: {
//   params: { ticketId: string };
// }) {
//   const [ticketCode, setTicketCode] = useState("");

//   useEffect(() => {
//     async function fetchTicket() {
//       const res = await fetch(`/api/tickets/${params.ticketId}`);
//       const data = await res.json();
//       setTicketCode(data.ticket.code); // ✅ 使用 ticket.code，而不是 ticket.id
//     }

//     fetchTicket();
//   }, [params.ticketId]);

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-semibold mb-4">Your Ticket QR Code</h1>
//       {ticketCode ? <TicketQRCode value={ticketCode} /> : <p>Loading...</p>}
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import TicketQRCode from "@/components/TicketQRCode";

// export default function TicketPage({
//   params,
// }: {
//   params: { ticketId: string };
// }) {
//   const [ticketCode, setTicketCode] = useState<string | null>(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function fetchTicket() {
//       try {
//         const res = await fetch(`/api/tickets/${params.ticketId}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Failed to load ticket");
//         setTicketCode(data.ticket.code); // ✅ 正确使用 ticket.code
//       } catch (err: any) {
//         setError(err.message);
//       }
//     }

//     fetchTicket();
//   }, [params.ticketId]);

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-semibold mb-4">Your Ticket QR Code</h1>
//       {error && <p className="text-red-500">❌ {error}</p>}
//       {ticketCode ? (
//         <TicketQRCode value={ticketCode} /> // ✅ 传入 ticket.code
//       ) : (
//         <p>Loading...</p>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // ✅ 使用 useParams hook
import TicketQRCode from "@/components/TicketQRCode";

export default function TicketPage() {
  const params = useParams(); // ✅ 解包 promise
  const ticketId = params.ticketId as string;

  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/tickets/${ticketId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load ticket");
        setTicketCode(data.ticket.code); // ✅ 使用 code
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
