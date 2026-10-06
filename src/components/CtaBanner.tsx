import { useLanguage } from "../lib/LanguageContext";
import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaButton({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}: {
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  const isPrimary = variant === "primary";

  const base =
    "font-inter inline-flex h-[52px] items-center justify-center gap-2 rounded-full px-8 text-base font-semibold tracking-[-0.01em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] active:translate-y-0 active:scale-95";
  const styles =
    isPrimary
      ? "bg-[#7b39fc] text-white shadow-lg shadow-[#7b39fc]/30 hover:-translate-y-0.5 hover:bg-[#6d28d9]"
      : "border border-gray-300 bg-white text-gray-900 shadow-sm hover:border-gray-400 hover:bg-gray-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-white/25 dark:hover:bg-white/10";

  const hover =
    isPrimary && !className.includes("shadow-[#7b39fc]/10")
      ? "hover:shadow-lg hover:shadow-[#7b39fc]/20"
      : "";

  return (
    <Link
      href={href}
      aria-label={typeof children === "string" ? children : undefined}
      className={`${base} ${styles} ${hover} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

export default function CtaBanner() {
  const { t } = useLanguage();
  return (
    <section className="landing-section-surface px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-[#7b39fc] p-10 md:p-16 text-center">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
              <Sparkles size={12} aria-hidden="true" />
              {t("land.ctaBadge")}
            </div>

            <h2 className="font-inter text-4xl font-extrabold leading-[1.06] tracking-[-0.03em] text-white md:text-6xl">
              {t("land.ctaTitlePrefix")}
              <br className="md:hidden" />
              <span className="text-white/90">{t("land.ctaTitleAccent")}</span>
            </h2>

            <p className="mx-auto mb-8 max-w-xl font-medium text-base text-white/80">
              {t("land.ctaSubtitle")}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <CtaButton href="/register" variant="primary">
                {t("land.ctaPrimary")}
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </CtaButton>
              <CtaButton href="#pricing" variant="secondary">
                {t("land.ctaSecondary")}
              </CtaButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
