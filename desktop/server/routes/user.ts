
const express = require("express");
const router = express.Router();
const { getSupabase } = require("../lib/supabase");
const { toApiRows, toSnakeRow } = require("../lib/transform");
const { authRequired } = require("../middleware/auth");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function pageOut(p) {
  return {
    id: p.id,
    type: p.type,
    label: p.label,
    icon: p.icon,
    iconColor: p.icon_color,
    parentId: p.parent_id,
    purpose: p.purpose,
    isTemplate: p.is_template,
    data: p.data,
    order: p.sort_order,
    sortOrder: p.sort_order,
    meta: p.meta,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

function taskInsertRows(tasks, userId) {
  return (tasks || []).map((t) => {
    const row = toSnakeRow(t);
    delete row._id;
    delete row.id;
    delete row.created_at;
    delete row.updated_at;
    row.user_id = userId;
    row.workspace_id = t.workspaceId || t.workspace || "personal";
    row.dependencies = Array.isArray(t.dependencies)
      ? t.dependencies.filter((d) => UUID_RE.test(String(d)))
      : [];
    return row;
  });
}

router.get("/data", authRequired, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.userId)
      .maybeSingle();
    if (error) throw error;
    if (!profile) return res.status(404).json({ message: "User not found" });

    const [pages, tasks, goals, ideas] = await Promise.all([
      supabase.from("pages").select("*").eq("user_id", req.userId).order("sort_order", { ascending: true }),
      supabase.from("tasks").select("*").eq("user_id", req.userId).order("created_at", { ascending: false }),
      supabase.from("goals").select("*").eq("user_id", req.userId).order("created_at", { ascending: false }),
      supabase.from("ideas").select("*").eq("user_id", req.userId).order("created_at", { ascending: false }),
    ]);

    res.json({
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      subscription: profile.subscription || { status: "inactive" },
      tasks: toApiRows(tasks.data),
      goals: toApiRows(goals.data),
      ideas: toApiRows(ideas.data),
      pages: (pages.data || []).map(pageOut),
      plannerMeta: profile.planner_meta || {},
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

router.get("/subscription", authRequired, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("subscription")
      .eq("id", req.userId)
      .maybeSingle();
    if (error) throw error;
    if (!profile) return res.status(404).json({ message: "User not found" });
    res.json({ subscription: profile.subscription || { status: "inactive" } });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ message: "Error fetching subscription" });
  }
});

router.post("/data", authRequired, async (req, res) => {
  try {
    const { tasks, goals, ideas, pages, plannerMeta } = req.body;
    const supabase = getSupabase();

    if (plannerMeta) {
      await supabase.from("profiles").update({ planner_meta: plannerMeta }).eq("id", req.userId);
    }

    // Sync Tasks (full replace for this user)
    if (tasks && Array.isArray(tasks)) {
      await supabase.from("tasks").delete().eq("user_id", req.userId);
      const rows = taskInsertRows(tasks, req.userId);
      if (rows.length) {
        const { error } = await supabase.from("tasks").insert(rows);
        if (error) throw error;
      }
    }

    // Sync Goals
    if (goals && Array.isArray(goals)) {
      const rows = goals.map((g) => ({
        user_id: req.userId,
        id: String(g.id),
        title: g.title,
        description: g.description,
        completed: !!g.completed,
        sub_goals: g.subGoals || [],
      }));
      if (rows.length) {
        const { error } = await supabase.from("goals").upsert(rows, { onConflict: "user_id,id" });
        if (error) throw error;
      }
    }

    // Sync Ideas
    if (ideas && Array.isArray(ideas)) {
      const rows = ideas.map((i) => ({
        user_id: req.userId,
        id: String(i.id),
        title: i.title,
        category: i.category,
      }));
      if (rows.length) {
        const { error } = await supabase.from("ideas").upsert(rows, { onConflict: "user_id,id" });
        if (error) throw error;
      }
    }

    // Sync Pages (incremental upsert preserving client ids + ordering)
    if (pages && Array.isArray(pages)) {
      const pageIds = pages.map((p) => String(p.id));
      await supabase.from("pages").delete().eq("user_id", req.userId).not("id", "in", `(${pageIds.map((id) => `"${id}"`).join(",")})`);

      const rows = pages.map((p, idx) => ({
        user_id: req.userId,
        id: String(p.id),
        type: p.type,
        label: p.label,
        icon: p.icon || "layout-dashboard",
        icon_color: p.iconColor || "text-gray-400",
        parent_id: p.parentId,
        purpose: p.purpose,
        is_template: !!p.isTemplate,
        data: p.data,
        sort_order: idx,
        updated_at: new Date().toISOString(),
      }));
      if (rows.length) {
        const { error } = await supabase.from("pages").upsert(rows, { onConflict: "user_id,id" });
        if (error) throw error;
      }
    }

    const [updatedPages, updatedTasks, updatedGoals, updatedIdeas] = await Promise.all([
      supabase.from("pages").select("*").eq("user_id", req.userId).order("sort_order", { ascending: true }),
      supabase.from("tasks").select("*").eq("user_id", req.userId).order("created_at", { ascending: false }),
      supabase.from("goals").select("*").eq("user_id", req.userId).order("created_at", { ascending: false }),
      supabase.from("ideas").select("*").eq("user_id", req.userId).order("created_at", { ascending: false }),
    ]);

    res.json({
      message: "Data updated successfully",
      tasks: toApiRows(updatedTasks.data),
      goals: toApiRows(updatedGoals.data),
      ideas: toApiRows(updatedIdeas.data),
      pages: (updatedPages.data || []).map(pageOut),
      plannerMeta,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ message: "Error updating user data" });
  }
});

module.exports = router;

