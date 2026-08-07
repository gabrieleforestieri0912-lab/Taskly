/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect } from "react";
import { Upload, File, Download, Trash2, X } from "lucide-react";
import { Button } from "./UIComponents";

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FileUploader() {
  const [files, setFiles] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("plannilab_files") || "[]");
      setFiles(saved);
    } catch (e) {
      setFiles([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("plannilab_files", JSON.stringify(files));
  }, [files]);

  async function handleFiles(selectedFiles: FileList | File[]) {
    const selected = Array.from(selectedFiles);
    const mapped = await Promise.all(
      selected.map(async (f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        data: await readFileAsDataURL(f),
        uploadedAt: Date.now(),
      })),
    );
    setFiles((s) => [...mapped, ...s]);
  }

  async function onChange(e) {
    if (e.target.files) {
      await handleFiles(e.target.files);
      e.target.value = null;
    }
  }

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  function download(file) {
    const a = document.createElement("a");
    a.href = file.data;
    a.download = file.name;
    a.click();
  }

  function remove(index) {
    setFiles((s) => s.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col h-full min-h-80">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Upload size={16} className="text-cyan-500" />
          Cloud File
        </h3>
      </div>

      <div
        className={`flex-1 p-5 overflow-y-auto custom-scrollbar space-y-3 ${isDragging ? "bg-cyan-50/50 dark:bg-cyan-900/10" : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
            <Upload size={32} className="mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">
              Trascina i file qui
            </p>
            <p className="text-[10px] mt-1">O clicca sul pulsante sotto</p>
          </div>
        ) : (
          files.map((f, i) => (
            <div
              key={i}
              className="group flex items-center justify-between gap-3 p-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                {f.type.startsWith("image/") ? (
                  <img
                    src={f.data}
                    alt={f.name}
                    className="w-10 h-10 object-cover rounded-xl shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-700">
                    <File size={18} className="text-gray-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-gray-700 dark:text-gray-200 truncate leading-tight">
                    {f.name}
                  </div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {(f.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => download(f)}
                  className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-cyan-600 transition-colors"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => remove(i)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-gray-50/50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-gray-800">
        <label className="relative w-full py-2.5 px-4 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 group">
          <Upload
            size={14}
            className="text-gray-400 group-hover:text-cyan-500"
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200">
            Seleziona File
          </span>
          <input type="file" onChange={onChange} multiple className="hidden" />
        </label>
      </div>
    </div>
  );
}
