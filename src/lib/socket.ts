import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export function initIO(server: any) {
  if (!io) {
    io = new IOServer(server, {
      path: '/api/socket_io',     // 这条路径必须与客户端一致
      addTrailingSlash: false,
    });
  }
  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}