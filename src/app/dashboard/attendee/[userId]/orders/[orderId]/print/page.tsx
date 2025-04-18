'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { jsPDF } from 'jspdf';
import TicketQRCode from '@/components/TicketQRCode';

export default function OrderPrintPage() {
  const { userId, orderId } = useParams() as {
    userId: string;
    orderId: string;
  };
  const [ticket, setTicket] = useState<{
    eventName: string;
    ticketTypeName: string;
    purchasedAt: string;
    checkedIn: boolean;
    code: string;
  } | null>(null);

  // 拉取 ticket 数据
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/attendees/${userId}/purchased`, {
        cache: 'no-store',
      });
      const { data } = await res.json();
      setTicket(data.find((t: any) => t.purchaseId === Number(orderId)) || null);
    })();
  }, [userId, orderId]);

  if (!ticket) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Arial' }}>
        Loading ticket…
      </div>
    );
  }

  const handleDownload = () => {
    const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' });
    const margin = 40;
    let y = margin;

    // 标题
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text(ticket.eventName, margin, y);
    y += 30;

    // 详情
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text(`Ticket Type: ${ticket.ticketTypeName}`, margin, y);
    y += 20;
    pdf.text(`Purchased At: ${new Date(ticket.purchasedAt).toLocaleString()}`, margin, y);
    y += 20;
    pdf.text(`Status: ${ticket.checkedIn ? 'Checked In' : 'Valid'}`, margin, y);
    y += 30;

    // 插入 QR 码：从 canvas 拿 image
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 150;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
      y += imgHeight + 20;
    } else {
      console.warn('QR canvas not found');
    }

    // 底部 code
    pdf.setFontSize(10);
    pdf.text(`Code: ${ticket.code}`, margin, y);

    // 触发下载
    pdf.save(`${ticket.eventName.replace(/\s+/g, '-')}-ticket.pdf`);
  };

  return (
    <div
      style={{
        padding: 40,
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
      }}
    >
      {/* 打印区域 */}
      <div
        id="print-area"
        style={{
          backgroundColor: '#ffffff',
          color: '#000000',
          maxWidth: 600,
          margin: '0 auto',
          padding: 32,
          border: '1px solid #ddd',
          borderRadius: 8,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>
          {ticket.eventName}
        </h1>
        <p style={{ margin: '4px 0' }}>
          🎟️ <strong>Ticket Type:</strong> {ticket.ticketTypeName}
        </p>
        <p style={{ margin: '4px 0' }}>
          🕓 <strong>Purchased At:</strong>{' '}
          {new Date(ticket.purchasedAt).toLocaleString()}
        </p>
        <p style={{ margin: '4px 0 16px' }}>
          ✅ <strong>Status:</strong>{' '}
          {ticket.checkedIn ? 'Checked In' : 'Valid'}
        </p>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {/* 这里传入 canvasId，让内部 canvas 拥有该 id */}
          <TicketQRCode value={ticket.code} canvasId="qr-canvas" />
        </div>

        <p style={{ fontSize: 12, color: '#666', textAlign: 'center', margin: 0 }}>
          Ticket Code: {ticket.code}
        </p>
      </div>

      {/* 下载按钮 */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button
          onClick={handleDownload}
          style={{
            padding: '8px 16px',
            backgroundColor: '#7f1dff',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Download Ticket (PDF)
        </button>
      </div>
    </div>
  );
}