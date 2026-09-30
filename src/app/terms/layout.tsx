import type { ReactNode } from "react";
import type { Metadata } from "next";

// Layout server della rotta: e' l'unico posto dove `metadata` puo' essere
// esportato, dato che page.tsx e' un Client Component (usa useLanguage).
export const metadata: Metadata = {
  title: "Termini - Taskly",
  description: "Termini e condizioni di Taskly.",
};

export default function TermsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
