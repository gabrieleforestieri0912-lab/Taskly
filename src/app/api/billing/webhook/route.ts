import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateProfileSubscription } from "@/lib/server/db";
import { getSupabase } from "@/lib/server/supabase";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      return new NextResponse("Stripe webhook non configurato.", { status: 500 });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const signature = request.headers.get("stripe-signature") as string;
    const rawBody = await request.text();
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;

      if (userId) {
        await updateProfileSubscription(userId, {
          status: "active",
          planId: planId || null,
          stripeCustomerId: session.customer || null,
          stripeSubscriptionId: session.subscription || null,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;
      const status = subscription.status || "inactive";
      const currentPeriodEnd = subscription.items.data[0]?.current_period_end
        ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
        : null;

      // Find users by stripeSubscriptionId and update their subscription
      const supabase = getSupabase();
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .filter(
          "subscription->>stripeSubscriptionId",
          "eq",
          subscription.id,
        );

      for (const profile of profiles || []) {
        await updateProfileSubscription(profile.id, {
          status,
          currentPeriodEnd,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", (error as Error).message);
    return new NextResponse(`Webhook Error: ${(error as Error).message}`, {
      status: 400,
    });
  }
}
