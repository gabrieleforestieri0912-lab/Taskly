import type { NextRequest } from "next/server";
import { getAuthUser } from "./auth";
import { getClientIp } from "./http";
import { getProfile, updateProfileSubscription } from "./db";
import { getPlan } from "@/lib/plans";

/**
 * Quota giornaliera messaggi AI (minichat + chat condividono la stessa route,
 * quindi un solo contatore copre entrambe).
 * - Utenti autenticati: 5/giorno sullo Starter, illimitati sui piani a
 *   pagamento. Conteggio persistente in profiles.subscription.aiQuota
 *   { date: "YYYY-MM-DD", count } — nessuna migrazione DB richiesta.
 * - Ospiti: stesso limite per IP (contatore in memoria, best-effort).
 * Fail-open: se il DB non risponde, la richiesta passa.
 */

const FREE_LIMIT =
  Number(process.env.AI_DAILY_LIMIT_FREE) > 0
    ? Number(process.env.AI_DAILY_LIMIT_FREE)
    : 5;

export interface QuotaResult {
  allowed: boolean;
  /** Messaggi rimasti oggi (null = illimitati o sconosciuti). */
  remaining: number | null;
  message?: string;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// Ospiti: in-memory per IP con reset giornaliero.
const guestMemory = new Map<string, { date: string; count: number }>();

function checkGuest(ip: string, limit: number): QuotaResult {
  const today = todayKey();
  const entry = guestMemory.get(ip);
  const count = entry && entry.date === today ? entry.count : 0;
  if (count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  const next = count + 1;
  guestMemory.set(ip, { date: today, count: next });
  if (guestMemory.size > 10_000) {
    for (const [k, v] of guestMemory) {
      if (v.date !== today) guestMemory.delete(k);
    }
  }
  return { allowed: true, remaining: limit - next };
}

export async function checkAiQuota(request: NextRequest): Promise<QuotaResult> {
  const user = getAuthUser(request);
  if (!user) {
    return checkGuest(getClientIp(request) || "unknown", FREE_LIMIT);
  }
  try {
    const profile = await getProfile(user.id);
    const plan = getPlan((profile as any)?.subscription || {});
    // null = illimitati (piani a pagamento)
    if (plan.dailyAiMessages === null) {
      return { allowed: true, remaining: null };
    }
    // Lo Starter segue l'env AI_DAILY_LIMIT_FREE (default 5).
    const limit = plan.id === "starter" ? FREE_LIMIT : plan.dailyAiMessages;
    const today = todayKey();
    const stored = ((profile as any)?.subscription as any)?.aiQuota;
    const count =
      stored && stored.date === today ? Number(stored.count) || 0 : 0;
    if (count >= limit) {
      return { allowed: false, remaining: 0 };
    }
    const next = count + 1;
    await updateProfileSubscription(user.id, {
      aiQuota: { date: today, count: next },
    });
    return { allowed: true, remaining: limit - next };
  } catch {
    return { allowed: true, remaining: null };
  }
}

export function quotaExceededMessage(limit: number): string {
  return `Hai esaurito i ${limit} messaggi AI giornalieri del tuo piano. Fai l'upgrade per continuare a usare l'assistente senza limiti.`;
}
