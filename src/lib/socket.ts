import { Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export function initIO(server: any) {
  if (!io) {
    io = new IOServer(server, {
      path: "/api/socket_io", // be consistent w/ client side
      addTrailingSlash: false,
    });
  }
  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
