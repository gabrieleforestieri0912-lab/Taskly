import type { ReactNode } from "react";
import type { Metadata } from "next";

// Layout server della rotta: e' l'unico posto dove `metadata` puo' essere
// esportato, dato che page.tsx e' un Client Component (usa useLanguage).
export const metadata: Metadata = {
  title: "Privacy Policy - Taskly",
  description: "Informativa completa sulla privacy di Taskly.",
};

export default function PrivacyLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
