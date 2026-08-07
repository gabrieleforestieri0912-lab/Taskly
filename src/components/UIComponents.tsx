"use client";

import React, { useState, useEffect, useRef } from "react";
import { Edit2, Check, X } from "lucide-react";
import { motion } from "framer-motion";

export const EditableTitle = ({
  title,
  onSave,
  className = "",
  autoEdit = false,
  locked = false,
  placeholder = "Nuova pagina",
}) => {
  const [isEditing, setIsEditing] = useState(() => Boolean(autoEdit));
  const ref = useRef<HTMLDivElement | null>(null);
  const initialTitleRef = useRef(title);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      const el = ref.current;
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    const current = ref.current?.textContent || "";
    const next = current.trim();
    if (next && next !== title) onSave(next);
    else if (!next && ref.current) {
      ref.current.textContent = title || "";
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    const original = initialTitleRef.current || "";
    if (ref.current) ref.current.textContent = original;
    setIsEditing(false);
  };

  if (locked) {
    return (
      <div className={className}>
        <h1 className="min-h-[1.1em] w-full text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
          {title || ""}
        </h1>
      </div>
    );
  }

  return (
    <div
      className={`group relative ${className}`}
      onMouseDown={(e) => {
        if (!isEditing) {
          e.preventDefault();
          initialTitleRef.current = title || "";
          setIsEditing(true);
        }
      }}
    >
      <div
        ref={ref}
        contentEditable={isEditing}
        suppressContentEditableWarning
        role="textbox"
        aria-label="Titolo pagina"
        onBlur={() => handleSave()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
            ref.current?.blur();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
            ref.current?.blur();
          }
        }}
        className={`min-h-[1.1em] w-full text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight outline-none ${isEditing ? "" : "cursor-text"}`}
      >
        {title || ""}
      </div>

      {/* placeholder overlay when empty */}
      {!title && !isEditing && (
        <div className="absolute left-0 top-0 pointer-events-none text-3xl md:text-5xl font-black text-gray-400 dark:text-gray-600 leading-tight">
          {placeholder}
        </div>
      )}

      {/* edit icon on hover */}
      {!isEditing && (
        <div className="absolute right-0 top-0 p-2 opacity-0 group-hover:opacity-100 bg-[#7b39fc]/10 dark:bg-[#7b39fc]/25 text-[#7b39fc] dark:text-[#a67cff] rounded-xl transition-all scale-90 group-hover:scale-100">
          <Edit2 size={20} />
        </div>
      )}
    </div>
  );
};

export const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white/40 dark:bg-gray-900/60 backdrop-blur-xl rounded-4xl shadow-xl shadow-[#7b39fc]/10 border border-[#7b39fc]/10 dark:border-gray-800/60 ${className}`}
  >
    {children}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

export const Button = ({
  children,
  variant = "default",
  className = "",
  size = "md",
  ...props
}) => {
  const base =
    "font-inter rounded-xl font-semibold transition-all duration-300 flex items-center justify-center backdrop-blur-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default:
      "bg-[#7b39fc] text-white hover:bg-[#8b4dff] shadow-lg shadow-[#7b39fc]/25 dark:shadow-none hover:shadow-[#7b39fc]/40 border-none",
    ghost:
      "hover:bg-[#7b39fc]/10 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#7b39fc] dark:hover:text-[#a67cff]",
  };

  const sizes = {
    md: "px-4 py-2",
    icon: "p-1.5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full border dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7b39fc] ${className}`}
  />
);

export const Badge = ({ children, className = "", variant = "default" }) => {
  const variants = {
    default:
      "bg-[#7b39fc]/10 text-[#6d28d9] dark:bg-[#7b39fc]/25 dark:text-[#a67cff]",
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    warning:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const Progress = ({ value, className = "" }) => (
  <div
    className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden ${className}`}
  >
    <div
      className="bg-[#7b39fc] h-full transition-all duration-500 ease-out rounded-full"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export const Checkbox = ({ checked, onChange }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    className="w-5 h-5 accent-[#7b39fc] rounded-lg cursor-pointer transition-transform active:scale-90"
  />
);

export const ScrollReveal = ({ children, delay = 0, direction = "up" }) => {
  const variants = {
    up: { y: 40, opacity: 0 },
    down: { y: -40, opacity: 0 },
    left: { x: 40, opacity: 0 },
    right: { x: -40, opacity: 0 },
    none: { opacity: 0 },
  };

  return (
    <motion.div
      initial={variants[direction]}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

export const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`}
  />
);

export const SkeletonCard = ({ className = "" }) => (
  <Card className={`p-6 space-y-4 ${className}`}>
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-1/3 h-4" />
        <Skeleton className="w-1/4 h-3" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="w-full h-3" />
      <Skeleton className="w-5/6 h-3" />
      <Skeleton className="w-4/6 h-3" />
    </div>
  </Card>
);
