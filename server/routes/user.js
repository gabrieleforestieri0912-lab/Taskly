const express = require("express");
const {
  getProfile,
  listPages,
  syncPages,
  listAllTasks,
  listGoals,
  listIdeas,
  replaceTasks,
  replaceGoals,
  replaceIdeas,
} = require("../supabase/db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/data", authRequired, async (req, res) => {
  try {
    const user = await getProfile(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [pages, tasks, goals, ideas] = await Promise.all([
      listPages(req.userId),
      listAllTasks(req.userId),
      listGoals(req.userId),
      listIdeas(req.userId),
    ]);

    res.json({
      name: user.name,
      email: user.email,
      picture: user.picture,
      subscription: user.subscription,
      tasks,
      goals,
      ideas,
      pages,
      plannerMeta: user.plannerMeta,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

router.get("/subscription", authRequired, async (req, res) => {
  try {
    const user = await getProfile(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ subscription: user.subscription || { status: "inactive" } });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ message: "Error fetching subscription" });
  }
});

router.post("/data", authRequired, async (req, res) => {
  try {
    const { tasks, goals, ideas, pages, plannerMeta } = req.body;

    // Update plannerMeta on the profile
    if (plannerMeta && typeof plannerMeta === "object") {
      const { getSupabase } = require("../supabase/client");
      await getSupabase()
        .from("profiles")
        .update({ planner_meta: plannerMeta })
        .eq("id", req.userId);
    }

    // Full-replace sync for tasks / goals / ideas (only when provided)
    const [updatedTasks, updatedGoals, updatedIdeas, updatedPages] = await Promise.all([
      tasks !== undefined ? replaceTasks(req.userId, tasks) : listAllTasks(req.userId),
      goals !== undefined ? replaceGoals(req.userId, goals) : listGoals(req.userId),
      ideas !== undefined ? replaceIdeas(req.userId, ideas) : listIdeas(req.userId),
      pages !== undefined ? syncPages(req.userId, pages) : listPages(req.userId),
    ]);

    res.json({
      message: "Data updated successfully",
      tasks: updatedTasks,
      goals: updatedGoals,
      ideas: updatedIdeas,
      pages: updatedPages,
      plannerMeta: plannerMeta || null,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ message: "Error updating user data" });
  }
});

module.exports = router;
