import { NextRequest, NextResponse } from "next/server";
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
} from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { getSupabase } from "@/lib/server/supabase";
import { getPlan } from "@/lib/plans";
import { parseBody, unauthorized } from "@/lib/server/http";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const profile = await getProfile(user.id);
    if (!profile) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const [pages, tasks, goals, ideas] = await Promise.all([
      listPages(user.id),
      listAllTasks(user.id),
      listGoals(user.id),
      listIdeas(user.id),
    ]);

    return NextResponse.json({
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      subscription: profile.subscription,
      plan: getPlan(profile.subscription || {}),
      tasks,
      goals,
      ideas,
      pages,
      plannerMeta: profile.plannerMeta,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "Error fetching user data" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const { tasks, goals, ideas, pages, plannerMeta } = body as {
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
        .eq("id", user.id);
    }

    // Plan enforcement: reject writes that exceed the plan's page limit.
    let plan: any = null;
    if (pages !== undefined && Array.isArray(pages)) {
      const profile = await getProfile(user.id);
      plan = getPlan(profile?.subscription || {});
      if (plan.maxPages !== null && pages.length > plan.maxPages) {
        return NextResponse.json(
          {
            message: "Limite del piano superato",
            error: "plan_limit_reached",
            plan,
            limit: plan.maxPages,
          },
          { status: 403 },
        );
      }
    }

    // Full-replace sync for tasks / goals / ideas (only when provided)
    const [updatedTasks, updatedGoals, updatedIdeas, updatedPages] =
      await Promise.all([
        tasks !== undefined
          ? replaceTasks(user.id, tasks as never[])
          : listAllTasks(user.id),
        goals !== undefined
          ? replaceGoals(user.id, goals as never[])
          : listGoals(user.id),
        ideas !== undefined
          ? replaceIdeas(user.id, ideas as never[])
          : listIdeas(user.id),
        pages !== undefined
          ? syncPages(user.id, pages as never[])
          : listPages(user.id),
      ]);

    return NextResponse.json({
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
    return NextResponse.json(
      { message: "Error updating user data" },
      { status: 500 },
    );
  }
}
