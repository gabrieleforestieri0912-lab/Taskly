import React, { useState } from "react";
import { Check, Zap, Star, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PricingCard = ({ 
  title, 
  price, 
  period, 
  description, 
  features, 
  buttonText, 
  isPopular, 
  isHighlighted,
  icon: Icon,
  onCheckout,
  loading
}) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`relative rounded-2xl p-5 md:p-6 flex flex-col h-full transition-all duration-500 ${
        isPopular 
          ? "bg-white dark:bg-gray-800 shadow-[0_20px_50px_rgba(123,57,252,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-2 border-[#7b39fc]/30 md:scale-[1.02] z-10" 
          : "bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/50 dark:border-white/5 shadow-xl"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-linear-to-r from-[#7b39fc] to-[#a67cff] rounded-full text-white text-xs font-black uppercase tracking-widest shadow-lg">
          Più Scelto
        </div>
      )}

      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-xl font-black dark:text-white mb-1 tracking-tight">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            {description}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${isPopular ? "bg-[#7b39fc]/10 dark:bg-[#7b39fc]/25 text-[#7b39fc] dark:text-[#a67cff]" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="mb-5 flex items-baseline gap-1">
        <span className="text-4xl font-black dark:text-white tracking-tighter">€{price}</span>
        <span className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-widest">/{period}</span>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3 group">
            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${isPopular ? "bg-[#7b39fc]/10 dark:bg-[#7b39fc]/25 text-[#7b39fc] dark:text-[#a67cff]" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
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
        {loading ? "Reindirizzamento..." : buttonText}
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};

function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleCheckout = async (plan) => {
    if (plan.checkoutType === "free") {
      window.location.href = "/register";
      return;
    }

    if (plan.checkoutType === "contact") {
      window.location.href = "mailto:sales@taskly.com?subject=Piano%20Team%20Taskly";
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
        throw new Error(data.message || "Checkout non disponibile.");
      }

      if (!data.url) {
        throw new Error("URL checkout non ricevuto dal server.");
      }
      window.location.href = data.url;
      return;
    } catch (error) {
      alert(error.message || "Errore durante il checkout.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      title: "Starter",
      description: "Ideale per studenti e freelancer che vogliono iniziare.",
      price: "0",
      period: "Sempre",
      icon: Star,
      features: [
        "Fino a 3 Pagine attive",
        "Task illimitati per pagina",
        "Visualizzazione Calendario base",
        "Note minimaliste",
        "Supporto via community"
      ],
      buttonText: "Inizia Gratis",
      isPopular: false,
      checkoutType: "free",
      checkoutPlanId: "starter"
    },
    {
      title: "Pro",
      description: "Tutto ciò di cui hai bisogno per la tua produttività quotidiana.",
      price: isAnnual ? "7" : "9",
      period: "Mese",
      icon: Zap,
      features: [
        "Pagine illimitate",
        "Workspace personalizzabili",
        "Tutti i moduli (Tasks, Goals, Note)",
        "Notifiche push intelligenti",
        "Export dati PDF/CSV",
        "Supporto prioritario 24/7"
      ],
      buttonText: "Scegli Pro",
      isPopular: true,
      checkoutType: "stripe",
      checkoutPlanId: isAnnual ? "pro_yearly" : "pro_monthly"
    },
    {
      title: "Team",
      description: "Per team piccoli che vogliono collaborare in tempo reale.",
      price: isAnnual ? "19" : "24",
      period: "Mese",
      icon: ShieldCheck,
      features: [
        "Fino a 5 membri inclusi",
        "Workspace condivisi",
        "Assegnazione Task avanzata",
        "Report di produttività team",
        "Integrazione Slack & Google",
        "Supporto Account Manager"
      ],
      buttonText: "Vai al Checkout Team",
      isPopular: false,
      checkoutType: "stripe",
      checkoutPlanId: isAnnual ? "team_yearly" : "team_monthly"
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
          Prezzi Chiari
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
           className="landing-heading-lg leading-tight mb-5"
        >
          Scegli il piano giusto <br />
          per il tuo <span className="landing-display-accent">focus.</span>
        </motion.h2>

        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${!isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>Mensile</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-16 h-9 rounded-full bg-gray-200 dark:bg-gray-800 p-1 relative transition-colors border border-gray-100 dark:border-gray-700"
          >
            <motion.div 
              animate={{ x: isAnnual ? 28 : 0 }}
              className="w-7 h-7 bg-white dark:bg-[#7b39fc] rounded-full shadow-lg"
            />
          </button>
          <div className="flex flex-col items-start leading-none">
            <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>Annuale</span>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-tight mt-0.5">Risparmia 20%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
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
        Hai bisogno di un piano personalizzato? <button className="text-[#7b39fc] dark:text-[#a67cff] font-bold hover:underline">Parla con noi</button>
      </motion.p>
    </section>
  );
}

export default Pricing;
