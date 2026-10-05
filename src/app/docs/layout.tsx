import type { ReactNode } from "react";
import DocsShell, { type DocNavigationItem } from "@/components/docs/DocsShell";
import { getAllDocs } from "@/lib/docs/content";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const docs: DocNavigationItem[] = getAllDocs().map(
    ({ content: _content, route: _route, ...navigationItem }) => navigationItem,
  );

  return <DocsShell docs={docs}>{children}</DocsShell>;
}
