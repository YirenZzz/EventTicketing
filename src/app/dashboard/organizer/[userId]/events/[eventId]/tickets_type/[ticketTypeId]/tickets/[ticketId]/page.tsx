import TicketQRCode from '@/components/TicketQRCode';

export default function TicketPage({ params }: { params: { ticketId: string } }) {
  const ticketCode = params.ticketId; // 或者从后端 fetch 获取更具体 ticketCode

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Your Ticket QR Code</h1>
      <TicketQRCode value={ticketCode} />
    </div>
  );
}