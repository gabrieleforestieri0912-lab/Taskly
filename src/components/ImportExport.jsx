"use client";
import React, { useRef, useState } from "react";
import { Download, Upload, FileText, Check, AlertCircle } from "lucide-react";
import { Button } from "./UIComponents";

export default function ImportExport({ initial = "", onChange }) {
  const [text, setText] = useState(initial);
  const [status, setStatus] = useState("idle"); // idle, success, error
  const fileRef = useRef(null);

  function exportMarkdown() {
    try {
      const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plannilab_export.md";
      a.click();
      URL.revokeObjectURL(url);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      setText(content);
      onChange?.(content);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    };
    reader.readAsText(f);
    e.target.value = null;
  }

  return (
    <div className="flex flex-col h-full min-h-80">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <FileText size={16} className="text-emerald-500" />
          Dati & Markdown
        </h3>
      </div>

      <div className="flex-1 p-5 flex flex-col gap-4">
        <div className="flex-1 relative group">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              onChange?.(e.target.value);
            }}
            placeholder="Incolla markdown qui o usa i tasti sotto..."
            className="w-full h-full p-4 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-mono text-gray-600 dark:text-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 outline-none resize-none transition-all"
          />
          <div className="absolute top-3 right-3">
            {status === "success" && (
              <Check
                size={14}
                className="text-emerald-500 animate-in fade-in zoom-in"
              />
            )}
            {status === "error" && (
              <AlertCircle
                size={14}
                className="text-red-500 animate-in fade-in zoom-in"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={exportMarkdown}
            className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Download size={14} />
            Esporta MD
          </button>

          <label className="flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95">
            <Upload size={14} />
            Importa MD
            <input
              ref={fileRef}
              type="file"
              accept=".md,text/markdown"
              onChange={onFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="p-4 bg-gray-50/50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-gray-800">
        <p className="text-[9px] font-bold text-center text-gray-400 uppercase tracking-widest leading-relaxed">
          Gestisci i tuoi contenuti in formato
          <br />
          standard Markdown portabile.
        </p>
      </div>
    </div>
  );
}
