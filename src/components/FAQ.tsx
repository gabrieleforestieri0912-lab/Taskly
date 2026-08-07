import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FAQ_ITEMS } from "../lib/faq";

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="rounded-2xl border border-[#7b39fc]/10 dark:border-[#a484d7]/15 bg-white/70 dark:bg-[#2b2344]/30 backdrop-blur-sm shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100">
          {item.question}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="landing-section relative px-4 py-20 bg-[#f6f7f9] dark:bg-[#1a1528] overflow-hidden sm:px-6">
<div className="absolute top-0 left-0 h-[320px] w-[min(360px,85vw)] bg-[#7b39fc]/10 dark:bg-[#7b39fc]/5 blur-[90px] rounded-full -translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-[320px] w-[min(360px,85vw)] bg-[#a67cff]/10 dark:bg-[#a67cff]/5 blur-[90px] rounded-full translate-y-1/3 translate-x-1/4 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="landing-eyebrow">
            <HelpCircle size={13} />
            FAQ
          </div>
          <h2 className="landing-heading-lg tracking-tight">
            Domande frequenti
          </h2>
          <p className="landing-body mt-3 text-sm md:text-base">
            Le risposte rapide alle domande piu comuni su piani, pagamenti e sicurezza.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <FAQItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex((prev) => (prev === index ? -1 : index))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
