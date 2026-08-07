"use client";
import React from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { Users, CheckCircle, Clock, Zap } from "lucide-react";

function AnimatedNumber({ value, suffix = "" }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  const spring = useSpring(0, {
    stiffness: 45,
    damping: 15,
  });

  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString() + suffix,
  );

  React.useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

const STATS = [
  {
    label: "Utenti Attivi",
    value: 12500,
    suffix: "+",
    icon: Users,
  },
  {
    label: "Task Completati",
    value: 850000,
    suffix: "+",
    icon: CheckCircle,
  },
  {
    label: "Ore Risparmiate",
    value: 45000,
    suffix: "",
    icon: Clock,
  },
  {
    label: "Performance",
    value: 99,
    suffix: "%",
    icon: Zap,
  },
];

export default function Stats() {
  return (
    <section className="landing-section-alt">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {STATS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="landing-card group flex flex-col items-center text-center hover:-translate-y-1"
            >
              <div className="landing-icon-wrap mb-4 transition-transform duration-300 group-hover:scale-110">
                <Icon size={22} />
              </div>
              <h3 className="font-instrument-serif text-4xl md:text-5xl leading-none tracking-[-0.02em] text-gray-900 dark:text-white mb-1.5">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </h3>
              <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
