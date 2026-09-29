
import { io } from "socket.io-client";
import { SOCKET_URL } from "./api";

let socket = null;

export function getSocket() {
  if (typeof window === "undefined") return null;

  if (!socket) {
    // Connect to the Express collaborative backend server on port 5000
    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"]
    });
    console.log("WebSocket collaboration engine initialized successfully.");
  }
  return socket;
}

