import express, { Router, Request, Response } from "express";
import {
  getProfile,
  listPages,
  syncPages,
  listAllTasks,
  listGoals,
  listIdeas,
  replaceTasks,
  replaceGoals,
  replaceIdeas,
} from "../supabase/db";
import { authRequired } from "../middleware/auth";
import { getSupabase } from "../supabase/client";
import { getPlan } from "../lib/plans";

const router: Router = express.Router();

router.get("/data", authRequired, async (req: Request, res: Response) => {
  try {
    const user = await getProfile(req.userId as string);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [pages, tasks, goals, ideas] = await Promise.all([
      listPages(req.userId as string),
      listAllTasks(req.userId as string),
      listGoals(req.userId as string),
      listIdeas(req.userId as string),
    ]);

    res.json({
      name: user.name,
      email: user.email,
      picture: user.picture,
      subscription: user.subscription,
      plan: getPlan(user.subscription || {}),
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

router.get(
  "/subscription",
  authRequired,
  async (req: Request, res: Response) => {
    try {
      const user = await getProfile(req.userId as string);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        subscription: user.subscription || { status: "inactive" },
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Error fetching subscription" });
    }
  },
);

router.post("/data", authRequired, async (req: Request, res: Response) => {
  try {
    const { tasks, goals, ideas, pages, plannerMeta } = req.body as {
      tasks?: unknown;
      goals?: unknown;
      ideas?: unknown;
      pages?: unknown;
      plannerMeta?: unknown;
    };

    // Update plannerMeta on the profile
    if (plannerMeta && typeof plannerMeta === "object") {
      await getSupabase()
        .from("profiles")
        .update({ planner_meta: plannerMeta })
        .eq("id", req.userId as string);
    }

    // Plan enforcement: reject writes that exceed the plan's page limit.
    let plan: any = null;
    if (pages !== undefined && Array.isArray(pages)) {
      const user = await getProfile(req.userId as string);
      plan = getPlan(user?.subscription || {});
      if (plan.maxPages !== null && pages.length > plan.maxPages) {
        return res.status(403).json({
          message: "Limite del piano superato",
          error: "plan_limit_reached",
          plan,
          limit: plan.maxPages,
        });
      }
    }

    // Full-replace sync for tasks / goals / ideas (only when provided)
    const [updatedTasks, updatedGoals, updatedIdeas, updatedPages] =
      await Promise.all([
        tasks !== undefined
          ? replaceTasks(req.userId as string, tasks as never[])
          : listAllTasks(req.userId as string),
        goals !== undefined
          ? replaceGoals(req.userId as string, goals as never[])
          : listGoals(req.userId as string),
        ideas !== undefined
          ? replaceIdeas(req.userId as string, ideas as never[])
          : listIdeas(req.userId as string),
        pages !== undefined
          ? syncPages(req.userId as string, pages as never[])
          : listPages(req.userId as string),
      ]);

    res.json({
      message: "Data updated successfully",
      plan,
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

export default router;
