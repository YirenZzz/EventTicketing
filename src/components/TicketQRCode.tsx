"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

/**
 * value: string to be encoded
 * canvasId: canvas element id
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
        if (err) console.error("QRCode error:", err);
      },
    );
  }, [value]);

  return (
    <canvas id={canvasId} ref={canvasRef} style={{ width: 150, height: 150 }} />
  );
}
