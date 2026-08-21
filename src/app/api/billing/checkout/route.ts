import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody } from "@/lib/server/http";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.APP_URL || "http://localhost:3000";

const PLAN_CONFIG: Record<
  string,
  { unitAmount: number; name: string; interval: "month" | "year" }
> = {
  pro_monthly: {
    unitAmount: 9,
    name: "Taskly Pro (Mensile)",
    interval: "month",
  },
  pro_yearly: { unitAmount: 7, name: "Taskly Pro (Annuale)", interval: "month" },
  team_monthly: {
    unitAmount: 24,
    name: "Taskly Team (Mensile)",
    interval: "month",
  },
  team_yearly: {
    unitAmount: 19,
    name: "Taskly Team (Annuale)",
    interval: "month",
  },
};

export async function POST(request: NextRequest) {
  const user = getAuthUser(request); // optional — anonymous checkout is allowed

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const { planId, email } = body as { planId?: string; email?: string };

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { message: "Stripe non configurato: manca STRIPE_SECRET_KEY." },
        { status: 500 },
      );
    }

    const plan = PLAN_CONFIG[planId || ""];
    if (!plan) {
      return NextResponse.json(
        { message: "Piano non valido per il checkout." },
        { status: 400 },
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            product_data: { name: plan.name },
            recurring: { interval: plan.interval },
            unit_amount: plan.unitAmount * 100,
          },
        },
      ],
      success_url: `${APP_URL}/dashboard?checkout=success`,
      cancel_url: `${APP_URL}/#pricing?checkout=cancel`,
      customer_email: email || undefined,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        planId: planId || "",
        userId: user?.id || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { message: "Errore durante la creazione del checkout." },
      { status: 500 },
    );
  }
}
