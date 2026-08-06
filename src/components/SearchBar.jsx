"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { buildIndex, searchIndex } from "../lib/searchIndex";
import SearchResults from "./SearchResults";
import { Search, Command, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBar({ pages = [] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      buildIndex(pages);
    } catch (e) {
      // ignore
    }
  }, [pages]);

  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setTimeout(() => setResults([]), 0);
      return;
    }

    const t = setTimeout(() => {
      const r = searchIndex(query);
      setResults(r);
    }, 150);

    return () => clearTimeout(t);
  }, [query]);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full relative z-10">
      <div 
        className={`relative group transition-all duration-300 ${
          isFocused ? "scale-[1.01]" : "scale-100"
        }`}
      >
        <div className={`absolute inset-y-0 left-4 flex items-center transition-colors duration-300 ${
          isFocused ? "text-cyan-500" : "text-gray-400 group-hover:text-gray-600"
        }`}>
          <Search size={18} strokeWidth={2.5} />
        </div>
        
        <input
          ref={inputRef}
          aria-label="Cerca nel workspace"
          placeholder="Cerca pagine, note, task... (⌘K)"
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full bg-white dark:bg-gray-800/80 border-2 py-3.5 pl-12 pr-16 rounded-2xl text-sm font-bold transition-all outline-none ${
            isFocused 
              ? "border-cyan-500/50 ring-4 ring-cyan-500/10 shadow-2xl shadow-cyan-500/10" 
              : "border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 group-hover:shadow-lg"
          }`}
        />

        <div className="absolute inset-y-0 right-4 flex items-center gap-2">
          {query ? (
            <button 
              onClick={() => setQuery("")}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
            >
              <X size={14} />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-[9px] font-black text-gray-400 uppercase tracking-tighter shadow-inner">
              <Command size={10} />
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isFocused && query.trim().length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3"
          >
            <SearchResults results={results} query={query} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
