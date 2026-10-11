import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "../lib/api";
import { normalizeIconKey } from "../lib/pageIcons";

/** Cache locale delle pagine: fallback istantaneo al reload per tutti. */
const PAGES_CACHE_KEY = "taskly_pages_v1";

function loadPagesCache(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PAGES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((p) => p && p.id !== undefined && p.id !== null);
      }
    }
  } catch {}
  return [];
}

export function useUserData() {
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    picture?: string;
    id?: string;
  } | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>(loadPagesCache);
  const [plannerMeta, setPlannerMeta] = useState<Record<string, any>>({});
  const [plan, setPlan] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoadedUserData, setHasLoadedUserData] = useState(false);
  // Vero dopo un fetch server riuscito: da quel momento la scrittura cache
  // riflette dati verificati (anche array vuoto = account davvero vuoto).
  const serverLoadedRef = useRef(false);

  const fetchUserData = useCallback(async (token: string) => {
    try {
      const response = await apiFetch("/user/data");

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        setGoals(data.goals || []);
        setIdeas(data.ideas || []);
        const rawPages = data.pages || [];
        const sanitizedPages = rawPages.map((page: any) => {
          // Icona: normalizza ma NON forzare un fallback.
          // undefined = "nessuna icona scelta" → il renderer usa il fallback per tipo.
          // "" esplicito = "icona rimossa" → mantieni "" così resta senza icona.
          const rawIcon = page.icon;
          const icon =
            rawIcon === ""
              ? ""
              : (normalizeIconKey(rawIcon) ??
                (typeof rawIcon === "string" && rawIcon.trim()
                  ? rawIcon.trim()
                  : undefined));
          return { ...page, icon };
        });
        setPages((currentPages) => {
          // Il server vince sui conflitti (fonte di verità); si tengono solo
          // le pagine locali con id sconosciuto al server (create offline).
          const merged = new Map(
            sanitizedPages.map((page: any) => [String(page.id), page]),
          );
          currentPages.forEach((page) => {
            const key = String(page?.id);
            if (!merged.has(key)) merged.set(key, page);
          });
          return Array.from(merged.values());
        });
        serverLoadedRef.current = true;
        setPlannerMeta(data.plannerMeta || {});
        setPlan(data.plan || null);
        setSubscription(data.subscription || null);

        if (data.name || data.email || data.picture) {
          const updatedUser = {
            name: data.name,
            email: data.email,
            picture: data.picture,
          };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
      setHasLoadedUserData(true);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      // Guest access: allow using the dashboard without an account.
      // Load with empty data; the UI falls back to a local state.
      setUser(null);
      setLoading(false);
      setHasLoadedUserData(true);
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchUserData(token);
  }, [fetchUserData]);

  // Persiste le pagine in locale a ogni modifica: al reload le pagine aperte
  // (e le tab che le referenziano) ci sono ancora. Mai sovrascrivere una
  // cache piena con un array vuoto prima di un fetch riuscito (token scaduto
  // o rete giù): altrimenti un reload svuoterebbe la sidebar.
  useEffect(() => {
    try {
      // Con token ma senza fetch riuscito (scaduto/rete giù), un array vuoto
      // significa "caricamento fallito", non "nessuna pagina": non distruggere
      // la cache. Senza token (ospite) lo svuotamento è sempre legittimo.
      if (pages.length === 0 && localStorage.getItem("token") && !serverLoadedRef.current) {
        const raw = localStorage.getItem(PAGES_CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          if (Array.isArray(cached) && cached.length > 0) return;
        }
      }
      localStorage.setItem(PAGES_CACHE_KEY, JSON.stringify(pages));
    } catch {
      // Quota esaurita o JSON non serializzabile: si continua senza cache.
    }
  }, [pages]);

  return {
    user,
    tasks,
    setTasks,
    goals,
    setGoals,
    ideas,
    setIdeas,
    pages,
    setPages,
    plannerMeta,
    setPlannerMeta,
    plan,
    subscription,
    loading,
    hasLoadedUserData,
  };
}
