'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

type TicketQRCodeProps = {
  value: string; // 通常是 ticketCode 或 ticketId
};

export default function TicketQRCode({ value }: TicketQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!value) return;

    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, { width: 200 }, (err) => {
        if (err) console.error('QR Code error:', err);
      });
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas ref={canvasRef} />
      <p className="text-xs text-gray-500 break-all">{value}</p>
    </div>
  );
}