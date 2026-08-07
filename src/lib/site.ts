export const SITE_NAME = "Taskly";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const SITE_DESCRIPTION =
  "Task, note, calendario e obiettivi in un unico workspace intelligente. Pianifica con chiarezza, collabora in tempo reale e lascia che l'AI ti aiuti ogni giorno.";