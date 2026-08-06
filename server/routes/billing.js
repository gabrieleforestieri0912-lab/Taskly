const express = require("express");
const Stripe = require("stripe");
const { getProfile, updateProfileSubscription } = require("../supabase/db");
const { authOptional, authRequired } = require("../middleware/auth");

const router = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const PLAN_CONFIG = {
  pro_monthly: { unitAmount: 9, name: "Taskly Pro (Mensile)", interval: "month" },
  pro_yearly: { unitAmount: 7, name: "Taskly Pro (Annuale)", interval: "month" },
  team_monthly: { unitAmount: 24, name: "Taskly Team (Mensile)", interval: "month" },
  team_yearly: { unitAmount: 19, name: "Taskly Team (Annuale)", interval: "month" },
};

router.post("/checkout", authOptional, async (req, res) => {
  try {
    const { planId, email } = req.body || {};

    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: "Stripe non configurato: manca STRIPE_SECRET_KEY." });
    }

    const plan = PLAN_CONFIG[planId];
    if (!plan) {
      return res.status(400).json({ message: "Piano non valido per il checkout." });
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
        planId,
        userId: req.userId || "",
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Errore durante la creazione del checkout." });
  }
});

router.post("/portal", authRequired, async (req, res) => {
  try {
    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: "Stripe non configurato: manca STRIPE_SECRET_KEY." });
    }

    const user = await getProfile(req.userId);
    const customerId = user?.subscription?.stripeCustomerId;
    if (!customerId) {
      return res.status(400).json({ message: "Nessun cliente Stripe associato a questo account." });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/settings?billing=returned`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    res.status(500).json({ message: "Errore durante l'apertura del portale clienti." });
  }
});

const stripeWebhookHandler = async (req, res) => {
  try {
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      return res.status(500).send("Stripe webhook non configurato.");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);

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

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const status = subscription.status || "inactive";
      const currentPeriodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;

      // Find users by stripeSubscriptionId and update their subscription
      const { getSupabase } = require("../supabase/client");
      const supabase = getSupabase();
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .filter("subscription->>stripeSubscriptionId", "eq", subscription.id);

      for (const profile of profiles || []) {
        await updateProfileSubscription(profile.id, {
          status,
          currentPeriodEnd,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

module.exports = { billingRouter: router, stripeWebhookHandler };
