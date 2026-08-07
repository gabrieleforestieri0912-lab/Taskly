import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/dashboard", priority: 0.7, changeFrequency: "weekly" },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" },
    { path: "/register", priority: 0.7, changeFrequency: "monthly" },
    { path: "/settings", priority: 0.3, changeFrequency: "monthly" },
    { path: "/meetings", priority: 0.4, changeFrequency: "monthly" },
    { path: "/integrations", priority: 0.4, changeFrequency: "monthly" },
    { path: "/transcription", priority: 0.4, changeFrequency: "monthly" },
    { path: "/docs", priority: 0.5, changeFrequency: "monthly" },
    { path: "/support", priority: 0.4, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

  return staticPages.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority,
  }));
}