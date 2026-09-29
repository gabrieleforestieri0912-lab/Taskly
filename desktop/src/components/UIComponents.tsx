
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Edit2, Check, X } from "lucide-react";
import { motion } from "framer-motion";

export const EditableTitle = ({
  title,
  onSave,
  className = "",
  autoEdit = false,
  placeholder = "Nuova pagina",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(title || "");
  const ref = useRef(null);
  const initialTitleRef = useRef(title);

  useEffect(() => {
    setValue(title);
  }, [title]);

  // If requested, enter edit mode on mount
  useEffect(() => {
    if (autoEdit) setIsEditing(true);
  }, [autoEdit]);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      // place caret at end
      const el = ref.current;
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isEditing]);

  const handleSave = () => {
    const next = (value || "").trim();
    if (next && next !== title) onSave(next);
    else if (!next) setValue(title || "");
    setIsEditing(false);
  };

  const handleCancel = () => {
    // revert to initial title when editing started
    const original = initialTitleRef.current || "";
    setValue(original);
    // do not call onSave when cancelling — just revert locally
    setIsEditing(false);
  };

  return (
    <div
      className={`group relative ${className}`}
      onMouseDown={(e) => {
        // Prevent the browser from placing the caret at the beginning on click
        if (!isEditing) {
          e.preventDefault();
          // remember the original value for potential cancel
          initialTitleRef.current = value || title || "";
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
        onInput={(e) => {
          const next = e.currentTarget.textContent || "";
          setValue(next);
        }}
        onBlur={() => handleSave()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            // commit and blur
            handleSave();
            ref.current.blur();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
            ref.current.blur();
          }
        }}
        className={`min-h-[1.1em] w-full text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight outline-none ${isEditing ? "" : "cursor-text"}`}
      >
        {value}
      </div>

      {/* placeholder overlay when empty */}
      {!value && !isEditing && (
        <div className="absolute left-0 top-0 pointer-events-none text-3xl md:text-5xl font-black text-gray-400 dark:text-gray-600 leading-tight">
          {placeholder}
        </div>
      )}

      {/* edit icon on hover */}
      {!isEditing && (
        <div className="absolute right-0 top-0 p-2 opacity-0 group-hover:opacity-100 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl transition-all scale-90 group-hover:scale-100">
          <Edit2 size={20} />
        </div>
      )}
    </div>
  );
};

export const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white/40 dark:bg-gray-900/60 backdrop-blur-xl rounded-4xl shadow-xl shadow-purple-500/5 border border-white/60 dark:border-gray-800/60 ${className}`}
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
    "rounded-xl font-semibold transition-all duration-300 flex items-center justify-center backdrop-blur-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default:
      "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-none hover:shadow-purple-300 border-none",
    ghost:
      "hover:bg-purple-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400",
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
    className={`w-full border dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
  />
);

export const Badge = ({ children, className = "", variant = "default" }) => {
  const variants = {
    default:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
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
      className="bg-purple-600 h-full transition-all duration-500 ease-out rounded-full"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export const Checkbox = ({ checked, onChange }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    className="w-5 h-5 accent-purple-600 rounded-lg cursor-pointer transition-transform active:scale-90"
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


