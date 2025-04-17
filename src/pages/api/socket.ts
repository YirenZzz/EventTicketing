// pages/api/socket.ts
import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    const ioServer = new IOServer(res.socket.server, {
      path: '/api/socket_io', // 必须和客户端 path 一致
      addTrailingSlash: false,
    });
    res.socket.server.io = ioServer;

    ioServer.on('connection', socket => {
      console.log('Socket connected:', socket.id);
    });
  }

  res.end();
}

export const config = {
  api: { bodyParser: false },
};