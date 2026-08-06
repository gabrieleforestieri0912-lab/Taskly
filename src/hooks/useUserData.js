import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";

export function useUserData() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [pages, setPages] = useState([]);
  const [plannerMeta, setPlannerMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasLoadedUserData, setHasLoadedUserData] = useState(false);
  const router = useRouter();

  const fetchUserData = useCallback(async (token) => {
    try {
      const response = await apiFetch("/user/data");

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        setGoals(data.goals || []);
        setIdeas(data.ideas || []);
        const rawPages = data.pages || [];
        const sanitizedPages = rawPages.map((page) => ({
          ...page,
          icon: typeof page.icon === "string" ? page.icon : "layout-dashboard",
        }));
        setPages(sanitizedPages);
        setPlannerMeta(data.plannerMeta || {});

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
      router.push("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchUserData(token);
  }, [router, fetchUserData]);

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
    loading,
    hasLoadedUserData
  };
}
