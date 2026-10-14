export interface PlanInfo {
  id: string;
  name: string;
  maxPages: number | null; // null = unlimited
  maxMembers: number | null;
  dailyAiMessages: number | null; // null = unlimited
}

interface Plan {
  id: string;
  name: string;
  maxPages: number | null;
  maxMembers: number | null;
  dailyAiMessages: number | null;
}

const PLANS: Record<string, Plan> = {
  // Creazione pagine illimitata su tutti i piani (nessun limite maxPages).
  // Chat AI: 5 messaggi/giorno sullo Starter, illimitati sui piani a pagamento.
  starter: { id: "starter", name: "Starter", maxPages: null, maxMembers: 1, dailyAiMessages: 5 },
  pro: { id: "pro", name: "Pro", maxPages: null, maxMembers: 5, dailyAiMessages: null },
  team: { id: "team", name: "Business", maxPages: null, maxMembers: 20, dailyAiMessages: null },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    maxPages: null,
    maxMembers: null,
    dailyAiMessages: null,
  },
};

export function getPlan(subscription: any): Plan {
  const planId = String(subscription?.planId || "");
  if (planId.startsWith("enterprise")) return PLANS.enterprise;
  if (planId.startsWith("team")) return PLANS.team;
  if (planId.startsWith("pro")) return PLANS.pro;
  return PLANS.starter;
}