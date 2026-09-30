import type { ReactNode } from "react";
import type { Metadata } from "next";

// Layout server della rotta: e' l'unico posto dove `metadata` puo' essere
// esportato, dato che page.tsx e' un Client Component (usa useLanguage).
export const metadata: Metadata = {
  title: "Supporto - Taskly",
  description: "Supporto e invio feedback per Taskly.",
};

export default function SupportLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
