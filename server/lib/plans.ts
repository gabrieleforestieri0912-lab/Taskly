export interface PlanInfo {
  id: string;
  name: string;
  maxPages: number | null; // null = unlimited
  maxMembers: number | null;
}

interface Plan {
  id: string;
  name: string;
  maxPages: number | null;
  maxMembers: number | null;
}

const PLANS: Record<string, Plan> = {
  starter: { id: "starter", name: "Starter", maxPages: 3, maxMembers: 1 },
  pro: { id: "pro", name: "Pro", maxPages: 50, maxMembers: 5 },
  team: { id: "team", name: "Business", maxPages: 500, maxMembers: 20 },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    maxPages: null,
    maxMembers: null,
  },
};

export function getPlan(subscription: any): Plan {
  const planId = String(subscription?.planId || "");
  if (planId.startsWith("enterprise")) return PLANS.enterprise;
  if (planId.startsWith("team")) return PLANS.team;
  if (planId.startsWith("pro")) return PLANS.pro;
  return PLANS.starter;
}