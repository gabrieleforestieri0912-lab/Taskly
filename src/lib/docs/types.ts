export type DocStatus = "stable" | "beta" | "coming-soon";

export interface DocHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  section: string;
  order: number;
  route: string;
  tags: string[];
  status: DocStatus;
  updated: string;
  content: string;
  headings: DocHeading[];
  searchText: string;
}
