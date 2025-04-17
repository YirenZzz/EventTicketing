// src/app/dashboard/organizer/[userId]/events/[eventId]/tickets_type/[ticketTypeId]/page.tsx
import { notFound } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

export default async function TicketTypePage({
  params,
}: {
  params: Promise<{ userId: string; eventId: string; ticketTypeId: string }>;
}) {
  const { userId, eventId, ticketTypeId } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/organizers/${userId}/events/${eventId}/ticket-types/${ticketTypeId}`,
    { cache: "no-store" },
  );

  if (!res.ok) return notFound();

  const { ticketType } = await res.json();

  return (
    <AppShell>
      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-screen py-10 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎟️ Ticket Type:{" "}
              <span className="text-blue-600">{ticketType.name}</span>
            </h1>
            <div className="text-gray-600">
              <p>
                📍 Event:{" "}
                <span className="text-gray-600">{ticketType.event.name}</span>
              </p>
              <p>
                🔢 Total Tickets:{" "}
                <span className="text-blue-600">{ticketType.quantity}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {ticketType.tickets.length === 0 ? (
              <p className="text-center text-gray-500 text-lg">
                No tickets generated.
              </p>
            ) : (
              <ul className="space-y-6">
                {ticketType.tickets.map((ticket: any) => {
                  const purchased = !!ticket.PurchasedTicket;
                  const purchaser = purchased
                    ? ticket.PurchasedTicket.user.name
                    : "N/A";
                  const purchaseTime = purchased
                    ? new Date(
                        ticket.PurchasedTicket.createdAt,
                      ).toLocaleString()
                    : "N/A";

                  return (
                    <li
                      key={ticket.code}
                      className="bg-white rounded-lg shadow-md border-l-4 border-blue-400 hover:border-blue-600 transition overflow-hidden"
                    >
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-semibold flex items-center gap-2 text-blue-600">
                            <span>🎫</span>
                            <span>Ticket Code:</span>
                            <span className="underline">{ticket.code}</span>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              ticket.checkedIn
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {ticket.checkedIn ? "Checked In" : "Not Checked In"}
                          </span>
                        </div>

                        <hr className="border-dashed my-2" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700">
                          <p>
                            <span className="font-medium">Purchased:</span>{" "}
                            {purchased ? (
                              <span className="text-green-600">Yes</span>
                            ) : (
                              <span className="text-red-500">No</span>
                            )}
                          </p>
                          <p>
                            <span className="font-medium">User:</span>{" "}
                            {purchaser}
                          </p>
                          <p>
                            <span className="font-medium">Purchase Time:</span>{" "}
                            {purchaseTime}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// return (
//   <AppShell>
//     <div className="max-w-3xl mx-auto p-8 space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold">Ticket Type: {ticketType.name}</h1>
//         <p className="text-gray-600">Event: {ticketType.event.name}</p>
//         <p className="text-gray-500">Total: {ticketType.quantity}</p>
//       </div>

//       <div className="mt-6 space-y-3">
//         {ticketType.tickets.length === 0 ? (
//           <p>No tickets generated.</p>
//         ) : (
//           <ul className="space-y-2">
//             {ticketType.tickets.map((ticket: any) => {
//               const purchased = !!ticket.PurchasedTicket;
//               const purchaser = purchased
//                 ? ticket.PurchasedTicket.user.name
//                 : "N/A";
//               const purchaseTime = purchased
//                 ? new Date(ticket.PurchasedTicket.createdAt).toLocaleString()
//                 : "N/A";
//               const checkedIn = ticket.checkedIn ? "✅ Yes" : "❌ No";

//               return (
//                 <li
//                   // key={ticket.id}
//                   key={ticket.code}
//                   className="border px-4 py-2 rounded flex justify-between items-center"
//                 >
//                   <div>
//                     {/* <p className="font-semibold">🎟️ Ticket ID: {ticket.id}</p> */}
//                     <p className="font-semibold">
//                       🎟️ Ticket Code: {ticket.code}
//                     </p>

//                     <p className="text-sm">
//                       Purchased: {purchased ? "✅ Yes" : "❌ No"}
//                     </p>
//                     <p className="text-sm">User: {purchaser}</p>
//                     <p className="text-sm">Purchase Time: {purchaseTime}</p>
//                     <p className="text-sm">Check-in: {checkedIn}</p>
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>
//         )}
//       </div>
//     </div>
//   </AppShell>
// );
