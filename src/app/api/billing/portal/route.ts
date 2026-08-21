import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getProfile } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { unauthorized } from "@/lib/server/http";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { message: "Stripe non configurato: manca STRIPE_SECRET_KEY." },
        { status: 500 },
      );
    }

    const profile = await getProfile(user.id);
    const customerId = (
      profile?.subscription as {
        stripeCustomerId?: string;
      }
    )?.stripeCustomerId;
    if (!customerId) {
      return NextResponse.json(
        {
          message: "Nessun cliente Stripe associato a questo account.",
        },
        { status: 400 },
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/settings?billing=returned`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { message: "Errore durante l'apertura del portale clienti." },
      { status: 500 },
    );
  }
}
