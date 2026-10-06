"use client";

import { usePathname } from "next/navigation";
import AIPanel from "./AIPanel";

const CHAT_PATHS = [
  "/activity",
  "/calendar",
  "/docs",
  "/integrations",
  "/notes",
  "/settings",
  "/tasks",
  "/team",
  "/templates",
  "/transcription",
];

export default function AppMiniChat() {
  const pathname = usePathname();
  const isAppPage =
    CHAT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith("/workspace/");

  if (!isAppPage) return null;

  return (
    <AIPanel
      onAction={() => ({
        ok: false,
        message: "Per gestire pagine e contenuti, apri la Dashboard.",
      })}
    />
  );
}
