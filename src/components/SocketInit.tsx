// src/components/SocketInit.tsx
'use client';

import { useEffect } from 'react';

export default function SocketInit() {
  useEffect(() => {
    fetch('/api/socket'); // 触发 Socket.IO 初始化
  }, []);

  return null;
}