"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Star, ShieldCheck, ArrowRight, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../lib/LanguageContext";

const PricingCard = ({
  title,
  price,
  period,
  description,
  features,
  buttonText,    isPopular,
  isHighlighted = false,
  icon: Icon,
  onCheckout,
  loading,
  mostChosenLabel,
  redirectingLabel
}) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`relative rounded-2xl p-5 md:p-6 flex flex-col h-full transition-all duration-500 ${
        isPopular
          ? "bg-white dark:bg-gray-800 shadow-[0_20px_50px_rgba(123,57,252,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-2 border-[#7b39fc]/30 md:scale-[1.02] z-10"
          : "bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200 dark:border-white/5 shadow-xl"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-linear-to-r from-[#7b39fc] to-[#a67cff] rounded-full text-white text-xs font-black uppercase tracking-widest shadow-lg">
          {mostChosenLabel}
        </div>
      )}

      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            {description}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${isPopular ? "bg-[#7b39fc]/10 dark:bg-[#7b39fc]/25 text-[#7b39fc] dark:text-[#a67cff]" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="mb-5 flex items-baseline gap-1">
        <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">€{price}</span>
        <span className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-widest">/{period}</span>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3 group">
            <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-500 transition-colors group-hover:bg-emerald-500/25">
              <Check size={12} strokeWidth={3} />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-tight">
              {feature}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onCheckout}
        disabled={loading}
        className={`w-full group relative flex items-center justify-center gap-2 py-3.5 rounded-xl font-black uppercase tracking-[0.15em] text-xs transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
        isPopular
          ? "bg-[#7b39fc] text-white hover:bg-[#8b4dff] hover:shadow-2xl hover:shadow-[#7b39fc]/25"
          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
      }`}
      >
        {loading ? redirectingLabel : buttonText}
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};

function Pricing() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);
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
      price: isAnnual ? "7.99" : "9.99",
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
      price: isAnnual ? "19.99" : "24.99",
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
      price: isAnnual ? "49.99" : "59.99",
      period: t("land.prPeriodMonth"),
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
      className="landing-section relative min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-white dark:bg-[#151020] overflow-hidden sm:px-6"
    >
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 h-[360px] w-[min(420px,85vw)] bg-[#7b39fc]/10 dark:bg-[#7b39fc]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[360px] w-[min(420px,85vw)] bg-[#a67cff]/10 dark:bg-[#a67cff]/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="text-center max-w-4xl mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="landing-eyebrow"
        >
          <Star size={12} fill="currentColor" />
          {t("land.prEyebrow")}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
           className="landing-heading-lg leading-tight mb-5"
        >
          {t("land.prTitlePrefix")} <br />
          {t("land.prTitleMiddle")} <span className="landing-display-accent">{t("land.prTitleAccent")}</span>
        </motion.h2>

        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${!isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>{t("land.prMonthly")}</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            aria-label={t("land.prAnnual")}
            className="w-16 h-9 rounded-full bg-gray-200 dark:bg-gray-800 p-1 relative transition-colors border border-gray-100 dark:border-gray-700"
          >
            <motion.div
              animate={{ x: isAnnual ? 28 : 0 }}
              className="w-7 h-7 bg-white dark:bg-[#7b39fc] rounded-full shadow-lg"
            />
          </button>
          <div className="flex flex-col items-start leading-none">
            <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>{t("land.prAnnual")}</span>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-tight mt-0.5">{t("land.prSave20")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full max-w-7xl relative z-10">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <PricingCard
              {...plan}
              loading={loadingPlan === plan.checkoutPlanId}
              onCheckout={() => handleCheckout(plan)}
              mostChosenLabel={t("land.prMostChosen")}
              redirectingLabel={t("land.prRedirecting")}
            />
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="mt-20 text-gray-500 dark:text-gray-400 text-sm font-medium"
      >
        {t("land.prCustomPrefix")} <button className="text-[#7b39fc] dark:text-[#a67cff] font-bold hover:underline">{t("land.prCustomLink")}</button>
      </motion.p>
    </section>
  );
}

export default Pricing;
