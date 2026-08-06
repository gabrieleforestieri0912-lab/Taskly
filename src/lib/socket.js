import { io } from "socket.io-client";
import { getAuthToken, SOCKET_URL } from "./api";

let socket = null;

export function getSocket() {
  if (typeof window === "undefined") return null;

  if (!socket) {
    // The Socket.IO backend runs on the separate API server (npm run server);
    // SOCKET_URL is NEXT_PUBLIC_SOCKET_URL (see src/lib/api.js).
    socket = io(SOCKET_URL, {
      autoConnect: true,
      auth: { token: getAuthToken() },
      transports: ["websocket", "polling"]
    });
    console.log("WebSocket collaboration engine initialized successfully.");
  }
  return socket;
}
