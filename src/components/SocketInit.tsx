// src/components/SocketInit.tsx
"use client";

import { useEffect } from "react";

export default function SocketInit() {
  useEffect(() => {
    fetch("/api/socket");
  }, []);

  return null;
}
