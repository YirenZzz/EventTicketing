'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

/**
 * value: 要编码的字符串
 * canvasId: 可选，给 canvas 元素设置 id，方便后续取到
 */
export default function TicketQRCode({
  value,
  canvasId,
}: {
  value: string;
  canvasId?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(
      canvasRef.current,
      value,
      { width: 150, margin: 1 },
      (err) => {
        if (err) console.error('QRCode error:', err);
      }
    );
  }, [value]);

  return (
    <canvas
      id={canvasId}
      ref={canvasRef}
      style={{ width: 150, height: 150 }}
    />
  );
}