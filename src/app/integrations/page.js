import Link from "next/link";
import { Webhook, CalendarDays, MessageSquare, ArrowLeft } from "lucide-react";

const integrations = [
  { name: "Google Calendar", status: "Da configurare", icon: CalendarDays },
  { name: "Slack", status: "Da configurare", icon: MessageSquare },
  { name: "Webhook API", status: "Pronto per backend", icon: Webhook },
];

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#7b39fc] dark:hover:text-[#a67cff]">
          <ArrowLeft size={16} />
          Dashboard
        </Link>
        <h1 className="mt-8 text-3xl font-black text-gray-900 dark:text-white">Integrazioni</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {integrations.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="landing-card">
                <div className="landing-icon-wrap">
                  <Icon size={22} />
                </div>
                <div className="mt-4 font-black text-gray-900 dark:text-white">{item.name}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">{item.status}</div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
