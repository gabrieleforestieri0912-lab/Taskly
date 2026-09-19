"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Container } from "./Container";
import { Section } from "./Section";
import { landingContent } from "@/content/landing";

export function Pricing() {
  const [yearly, setYearly] = useState(false);
  const { eyebrow, title, toggleMonthly, toggleYearly, plans, footnote } = landingContent.pricing;

  return (
    <Section variant="alt" id="prezzi">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="landing-eyebrow">{eyebrow}</span>
          <h2 className="landing-heading-lg">{title}</h2>
          <div className="mt-6 inline-flex rounded-full bg-white p-1 shadow-sm border dark:bg-white/5 dark:border-white/10">
            <button
              onClick={() => setYearly(false)}
              aria-pressed={!yearly}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!yearly ? "bg-[#7b39fc] text-white" : "text-muted-foreground"}`}
            >
              {toggleMonthly}
            </button>
            <button
              onClick={() => setYearly(true)}
              aria-pressed={yearly}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${yearly ? "bg-[#7b39fc] text-white" : "text-muted-foreground"}`}
            >
              {toggleYearly}
            </button>
          </div>
          {yearly && <p className="mt-2 text-xs text-muted-foreground">Risparmia 20% con fatturazione annuale — TODO</p>}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.highlighted
                  ? "bg-[#7b39fc] text-white border-[#7b39fc] shadow-xl shadow-[#7b39fc]/20 scale-[1.02]"
                  : "bg-white dark:bg-[#1a1528] border-black/10 dark:border-white/10"
              }`}
            >
              <h3 className={`text-lg font-semibold ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-white" : "text-emerald-500"}`} />
                    <span className={plan.highlighted ? "text-white/90" : "text-gray-600 dark:text-gray-300"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-6 inline-flex h-10 items-center justify-center rounded-xl px-6 text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-white text-[#7b39fc] hover:bg-gray-100"
                    : "bg-[#7b39fc] text-white hover:bg-[#6d28d9]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">{footnote}</p>
      </Container>
    </Section>
  );
}
