"use client";

import type { JSX } from "react";
import { usePathname } from "next/navigation";
import MiniChat from "./MiniChat";

const CHAT_PATHS = [
  "/activity",
  "/calendar",
  "/dashboard",
  "/docs",
  "/integrations",
  "/notes",
  "/settings",
  "/tasks",
  "/templates",
  "/transcription",
  "/workspaces",
];

export default function DesktopMiniChatHost(): JSX.Element | null {
  const pathname = usePathname();
  const showMiniChat = CHAT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return showMiniChat ? <MiniChat enabled /> : null;
}
