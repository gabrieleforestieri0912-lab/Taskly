"use client";

import { useLanguage } from "../lib/LanguageContext";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Star, ShieldCheck, ArrowRight, Building2 } from "lucide-react";

const PricingCard = ({ 
  title, 
  price, 
  period, 
  description, 
  features, 
  buttonText,    
  isPopular, 
  icon: Icon,
  onCheckout,
  loading
}) => {
  const { t, tWith } = useLanguage();
  return (
    <div className={`relative rounded-2xl p-5 md:p-6 flex flex-col h-full transition-colors ${
      isPopular 
        ? "bg-white dark:bg-black border-2 border-(--accent) shadow-lg" 
        : "bg-white dark:bg-black border border-gray-200 dark:border-gray-800"
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-(--accent) rounded-full text-white text-xs font-black uppercase tracking-widest">
          {t("land.prMostChosen")}
        </div>
      )}

      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-xl font-black dark:text-white mb-1 tracking-tight">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            {description}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${isPopular ? "bg-(--accent)/10 dark:bg-(--accent)/20 text-(--accent) dark:text-(--accent-300)" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="mb-5 flex items-baseline gap-1">
        <span className="text-4xl font-black dark:text-white tracking-tighter">€{price}</span>
        <span className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-widest">/{period}</span>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-500">
              <Check size={12} strokeWidth={3} />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-tight">
              {feature}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onCheckout}
        disabled={loading}
        className={`w-full group relative flex items-center justify-center gap-2 py-3.5 rounded-xl font-black uppercase tracking-[0.15em] text-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        isPopular 
          ? "bg-(--accent) text-white hover:bg-(--accent-hover)" 
          : "bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
      >
        {loading ? t("land.prRedirecting") : buttonText}
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

function Pricing() {
  const { t, tWith } = useLanguage();
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleCheckout = async (plan) => {
    if (plan.checkoutType === "free") {
      router.push("/register");
      return;
    }

    if (plan.checkoutType === "contact") {
      window.location.href = "mailto:gabriele.forestieri0912@gmail.com?subject=Piano%20Team%20Taskly";
      return;
    }

    setLoadingPlan(plan.checkoutPlanId);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const token = localStorage.getItem("token");
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          planId: plan.checkoutPlanId,
          email: user?.email,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || t("land.prErrCheckout"));
      }

      if (!data.url) {
        throw new Error(t("land.prErrNoUrl"));
      }
      window.location.href = data.url;
      return;
    } catch (error: any) {
      alert(error.message || t("land.prErrGeneric"));
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      title: "Starter",
      description: t("land.prStarterDesc"),
      price: "0",
      period: t("land.prPeriodAlways"),
      icon: Star,
      features: [
        t("land.prStarterF1"),
        t("land.prStarterF2"),
        t("land.prStarterF3"),
        t("land.prStarterF4"),
        t("land.prStarterF5"),
        t("land.prStarterF6")
      ],
      buttonText: t("land.prStarterBtn"),
      isPopular: false,
      checkoutType: "free",
      checkoutPlanId: "starter"
    },
    {
      title: "Pro",
      description: t("land.prProDesc"),
      price: isAnnual ? "4.79" : "5.99",
      period: t("land.prPeriodMonth"),
      icon: Zap,
      features: [
        t("land.prProF1"),
        t("land.prProF2"),
        t("land.prProF3"),
        t("land.prProF4"),
        t("land.prProF5"),
        t("land.prProF6"),
        t("land.prProF7")
      ],
      buttonText: t("land.prProBtn"),
      isPopular: true,
      checkoutType: "stripe",
      checkoutPlanId: isAnnual ? "pro_yearly" : "pro_monthly"
    },
    {
      title: "Business",
      description: t("land.prBizDesc"),
      price: isAnnual ? "11.99" : "14.99",
      period: t("land.prPeriodMonth"),
      icon: ShieldCheck,
      features: [
        t("land.prBizF1"),
        t("land.prBizF2"),
        t("land.prBizF3"),
        t("land.prBizF4"),
        t("land.prBizF5"),
        t("land.prBizF6"),
        t("land.prBizF7")
      ],
      buttonText: t("land.prBizBtn"),
      isPopular: false,
      checkoutType: "stripe",
      checkoutPlanId: isAnnual ? "team_yearly" : "team_monthly"
    },
    {
      title: "Enterprise",
      description: t("land.prEntDesc"),
      price: "Contattaci",
      period: "",
      icon: Building2,
      features: [
        t("land.prEntF1"),
        t("land.prEntF2"),
        t("land.prEntF3"),
        t("land.prEntF4"),
        t("land.prEntF5"),
        t("land.prEntF6"),
        t("land.prEntF7")
      ],
      buttonText: t("land.prEntBtn"),
      isPopular: false,
      checkoutType: "contact",
      checkoutPlanId: "enterprise"
    }
  ];

  return (
    <section
      id="pricing"
      className="landing-section landing-section-surface relative flex flex-col items-center justify-center px-4 py-20 overflow-hidden sm:px-6"
    >

      <div className="text-center max-w-4xl mb-12 relative z-10">
        <div className="landing-eyebrow">
          <Star size={12} fill="currentColor" />{t("land.prEyebrow")}</div>
        
        <h2 className="landing-heading-lg mb-5">{t("land.prTitlePrefix")}<br />{t("land.prTitleMiddle")}<span className="landing-display-accent">{t("land.prTitleAccent")}</span>
        </h2>

        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${!isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>{t("views.tasksMonthly")}</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-800 p-1 relative transition-colors border border-gray-200 dark:border-gray-700"
          >
            <div 
              style={{ transform: `translateX(${isAnnual ? '28px' : '0'})` }}
              className="w-6 h-6 bg-white dark:bg-(--accent) rounded-full shadow-lg transition-transform duration-200"
            />
          </button>
          <div className="flex flex-col items-start leading-none">
            <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>{t("views.goalsAnnual")}</span>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-tight mt-0.5">{t("land.prSave20")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full max-w-7xl relative z-10">
        {plans.map((plan, index) => (
          <div key={plan.title}>
            <PricingCard
              {...plan}
              loading={loadingPlan === plan.checkoutPlanId}
              onCheckout={() => handleCheckout(plan)}
            />
          </div>
        ))}
      </div>

      <p className="mt-20 text-gray-500 dark:text-gray-400 text-sm font-medium">{t("land.prCustomPrefix")}<button className="text-(--accent) dark:text-(--accent-300) font-bold hover:underline">{t("land.prCustomLink")}</button>
      </p>
    </section>
  );
}

export default Pricing;