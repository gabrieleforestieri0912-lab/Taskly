import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../lib/api";
import { normalizeIconKey } from "../lib/pageIcons";

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
  const [pages, setPages] = useState<any[]>([]);
  const [plannerMeta, setPlannerMeta] = useState<Record<string, any>>({});
  const [plan, setPlan] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoadedUserData, setHasLoadedUserData] = useState(false);

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
          const merged = new Map(
            sanitizedPages.map((page: any) => [String(page.id), page]),
          );
          currentPages.forEach((page) => {
            merged.set(String(page.id), page);
          });
          return Array.from(merged.values());
        });
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
