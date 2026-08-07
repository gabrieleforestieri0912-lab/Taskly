import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

interface RemoteCursor {
  userName?: string;
  x: number;
  y: number;
  timestamp: number;
}

export function useDashboardSocket(
  socket: Socket | null,
  activePageId: string | null,
  user: { id?: string; email?: string; name?: string } | null,
  setPages: React.Dispatch<React.SetStateAction<any[]>>,
) {
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({});

  useEffect(() => {
    if (!socket || !activePageId) return;

    // Join room for the current active page
    socket.emit("join-room", String(activePageId));

    const handleRemoteUpdate = ({
      pageId,
      data,
      source,
    }: {
      pageId: unknown;
      data: unknown;
      source: unknown;
    }) => {
      if (String(pageId) === String(activePageId) && source !== socket.id) {
        setPages((prev) =>
          prev.map((page) =>
            String(page.id) === String(pageId)
              ? { ...page, data }
              : page,
          ),
        );
      }
    };

    const handleRemoteCursor = ({
      userId,
      userName,
      x,
      y,
    }: {
      userId: string;
      userName?: string;
      x: number;
      y: number;
    }) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [userId]: { userName, x, y, timestamp: Date.now() },
      }));
    };

    socket.on("page-update", handleRemoteUpdate);
    socket.on("cursor-move", handleRemoteCursor);

    // Filter inactive cursors
    const interval = setInterval(() => {
      setRemoteCursors((prev) => {
        const next = { ...prev };
        let changed = false;
        const now = Date.now();
        Object.keys(next).forEach((id) => {
          if (now - next[id].timestamp > 4000) {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 2000);

    return () => {
      socket.emit("leave-room", String(activePageId));
      socket.off("page-update", handleRemoteUpdate);
      socket.off("cursor-move", handleRemoteCursor);
      clearInterval(interval);
    };
  }, [socket, activePageId, setPages]);

  useEffect(() => {
    if (!socket || !activePageId || !user) return;

    const handleMouseMove = (e: MouseEvent) => {
      socket.emit("cursor-move", {
        pageId: activePageId,
        userId: user.id || user.email,
        userName: user.name,
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [socket, activePageId, user]);

  return { remoteCursors };
}
