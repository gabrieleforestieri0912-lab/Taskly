"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

export type CoachPlacement = "right" | "left" | "bottom" | "top";

export interface CoachStep {
  /** CSS selector of the element to spotlight. */
  target: string;
  title: string;
  description: string;
  placement?: CoachPlacement;
  /** Extra px of breathing room drawn around the highlighted element. */
  padding?: number;
  /** Custom content rendered inside the popover (forms, live preview, …). */
  children?: React.ReactNode;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Spot {
  rect: Rect;
  placement: CoachPlacement;
}

const GAP = 14;
const MARGIN = 12;
const POPOVER_W = 340;

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

function place(target: Rect, pop: { w: number; h: number }, preferred: CoachPlacement): Spot {
  const vw = typeof window === "undefined" ? 0 : window.innerWidth;
  const vh = typeof window === "undefined" ? 0 : window.innerHeight;
  const centerX = target.left + target.width / 2;
  const centerY = target.top + target.height / 2;

  const fits: Record<CoachPlacement, boolean> = {
    right: target.left + target.width + GAP + pop.w + MARGIN <= vw,
    left: target.left - GAP - pop.w - MARGIN >= 0,
    bottom: target.top + target.height + GAP + pop.h + MARGIN <= vh,
    top: target.top - GAP - pop.h - MARGIN >= 0,
  };

  const order: CoachPlacement[] =
    preferred === "right" || preferred === "left"
      ? [preferred, preferred === "right" ? "bottom" : "top", preferred === "right" ? "left" : "right", preferred === "right" ? "top" : "bottom"]
      : [preferred, preferred === "bottom" ? "right" : "left", preferred === "bottom" ? "top" : "bottom", preferred === "bottom" ? "left" : "right"];

  const placement = (fits[preferred] ? preferred : order.find((p) => fits[p]) ?? "bottom");

  let left = 0;
  let top = 0;
  if (placement === "right") left = target.left + target.width + GAP;
  if (placement === "left") left = target.left - GAP - pop.w;
  if (placement === "bottom") left = centerX - pop.w / 2;
  if (placement === "top") left = centerX - pop.w / 2;

  if (placement === "right" || placement === "left") {
    top = centerY - pop.h / 2;
  } else {
    top =
      placement === "bottom"
        ? target.top + target.height + GAP
        : target.top - GAP - pop.h;
  }

  left = clamp(left, MARGIN, Math.max(MARGIN, vw - pop.w - MARGIN));
  top = clamp(top, MARGIN, Math.max(MARGIN, vh - pop.h - MARGIN));

  return { rect: { left, top, width: pop.w, height: pop.h }, placement };
}

/**
 * Coach-mark tour: dims the whole viewport, cuts a spotlight hole over the
 * element the step is talking about and floats the popover next to it.
 * Falls back to a centred popover when the target cannot be found, so a
 * refactor of the host UI degrades instead of breaking the tour.
 */
export default function CoachTour({
  steps,
  isOpen,
  onFinish,
  onStepChange,
  finishLabel = "Inizia",
}: {
  steps: CoachStep[];
  isOpen: boolean;
  onFinish: () => void;
  onStepChange?: (index: number) => void;
  finishLabel?: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [found, setFound] = useState(true);
  const popRef = useRef<HTMLDivElement | null>(null);
  const [popSize, setPopSize] = useState({ w: POPOVER_W, h: 220 });

  const step = steps[index];

  const go = useCallback(
    (next: number) => {
      if (next >= steps.length) {
        onFinish();
        return;
      }
      setIndex(next);
      onStepChange?.(next);
    },
    [steps.length, onFinish, onStepChange],
  );

  // Reset when reopened.
  useEffect(() => {
    if (isOpen) {
      setIndex(0);
      onStepChange?.(0);
    } else {
      setSpot(null);
    }
  }, [isOpen, onStepChange]);

  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) {
      setFound(false);
      setSpot(null);
      return;
    }
    setFound(true);
    const pad = step.padding ?? 8;
    const r = el.getBoundingClientRect();
    const target: Rect = {
      left: r.left - pad,
      top: r.top - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    };
    setSpot(place(target, popSize, step.placement ?? "right"));
  }, [step, popSize]);

  useLayoutEffect(() => {
    if (!isOpen || !step) return;
    const el = document.querySelector(step.target) as HTMLElement | null;
    el?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    measure();
  }, [isOpen, index, step, measure, reduce]);

  // Keep the spotlight glued to the element while it moves (resize, scroll,
  // sidebar collapse, async content shifting layout).
  useEffect(() => {
    if (!isOpen || !found) return;
    const handler = () => measure();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    const t = window.setInterval(handler, 400);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
      window.clearInterval(t);
    };
  }, [isOpen, found, measure]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFinish();
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft" && index > 0) go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, index, go, onFinish]);

  useLayoutEffect(() => {
    const el = popRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width && (Math.abs(r.width - popSize.w) > 1 || Math.abs(r.height - popSize.h) > 1)) {
      setPopSize({ w: r.width, h: r.height });
    }
  }, [popSize.w, popSize.h, step, index]);

  const radius = useMemo(() => 14, []);

  if (!isOpen || !step) return null;

  const hw = typeof window === "undefined" ? 0 : window.innerWidth;
  const hh = typeof window === "undefined" ? 0 : window.innerHeight;

  // SVG mask path: full viewport minus a rounded rect hole.
  const hole = found && spot
    ? `M${spot.rect.left + radius},${spot.rect.top} h${spot.rect.width - radius * 2} a${radius},${radius} 0 0 1 ${radius},${radius} v${spot.rect.height - radius * 2} a${radius},${radius} 0 0 1 -${radius},${radius} h-${spot.rect.width - radius * 2} a${radius},${radius} 0 0 1 -${radius},-${radius} v-${spot.rect.height - radius * 2} a${radius},${radius} 0 0 1 ${radius},-${radius} Z`
    : "";
  const maskPath = `${hole} M0,0 H${hw} V${hh} H0 Z`;

  const style: React.CSSProperties =
    found && spot
      ? { left: spot.rect.left, top: spot.rect.top, width: spot.rect.width, height: spot.rect.height }
      : {
          left: MARGIN,
          top: hh / 2,
          width: hw - MARGIN * 2,
          height: 0,
        };

  return (
    <div className="fixed inset-0 z-[130]" role="dialog" aria-modal="true">
      {/* Dimmed layer with the spotlight cutout. Clicks outside are ignored
          so the tour stays in control of the flow. */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <mask id="coach-tour-mask">
            <rect width={hw} height={hh} fill="white" />
            {hole && <path d={maskPath} fill="black" />}
          </mask>
        </defs>
        <rect
          width={hw}
          height={hh}
          fill="rgba(5,3,12,0.72)"
          mask="url(#coach-tour-mask)"
        />
      </svg>

      {/* Emphasised border on the highlighted area. */}
      {found && spot && (
        <motion.div
          className="absolute rounded-[14px] ring-2 ring-[#a67cff] shadow-[0_0_0_9999px_rgba(5,3,12,0.28)] pointer-events-none"
          style={style}
          initial={reduce ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduce ? 0 : 0.22, ease: "easeOut" }}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          ref={popRef}
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.97, y: 4 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: "easeOut" }}
          style={
            found && spot
              ? { left: spot.rect.left, top: spot.rect.top, width: popSize.w }
              : { left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: popSize.w }
          }
          className="absolute rounded-3xl border border-[#a67cff]/40 bg-white dark:bg-gray-900 shadow-2xl p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#7b39fc] dark:text-[#a67cff]">
                {index + 1} / {steps.length}
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white mt-1">
                {step.title}
              </h3>
            </div>
            <button
              onClick={onFinish}
              aria-label="Chiudi introduzione"
              className="shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
            {step.description}
          </p>

          {step.children && <div className="mt-3">{step.children}</div>}

          <div className="flex items-center justify-between gap-3 mt-4">
            <button
              onClick={() => (index > 0 ? go(index - 1) : onFinish())}
              className="text-[11px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {index > 0 ? "Indietro" : "Salta"}
            </button>
            <button
              onClick={() => go(index + 1)}
              className="px-4 py-2 rounded-xl bg-[#7b39fc] text-white text-[11px] font-black hover:brightness-110 shadow-md shadow-[#7b39fc]/25 transition-all"
            >
              {index === steps.length - 1 ? finishLabel : "Avanti"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
