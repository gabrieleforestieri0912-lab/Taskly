"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Play } from "lucide-react";

export default function ProductDemo() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section className="landing-section px-4 py-20 bg-[#f6f7f9] dark:bg-[#1a1528] sm:px-6">
      <div className="max-w-6xl mx-auto grid min-w-0 lg:grid-cols-2 gap-10 items-center">
        <div className="min-w-0">
          <div className="landing-eyebrow">Demo prodotto</div>
          <h2 className="landing-heading-lg mt-3">
            Guarda il prodotto reale{" "}
            <span className="landing-display-accent">in azione</span>
          </h2>
          <p className="landing-body mt-4">
            Una vista concreta di dashboard, planning e note collegate per capire subito il valore.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#7b39fc] dark:text-[#a67cff]" /> Workflow task e obiettivi nello stesso spazio</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#7b39fc] dark:text-[#a67cff]" /> Organizzazione per pagine annidate</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#7b39fc] dark:text-[#a67cff]" /> Supporto AI contestuale nella dashboard</li>
          </ul>
          <div className="mt-7">
            <Link href="/register" className="landing-btn-primary">
              Prova la demo nel tuo account
            </Link>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-900 p-3 shadow-xl sm:p-5">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="relative aspect-video bg-gradient-to-br from-[#7b39fc]/20 to-[#a67cff]/20 flex items-center justify-center group">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                src="/demo.mp4"
                poster="/demo-poster.jpg"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              {!isPlaying && (
                <button
                  onClick={handlePlay}
                  className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#7b39fc] to-[#a67cff] text-white transition-transform hover:scale-105 shadow-2xl shadow-[#7b39fc]/30"
                >
                  <Play size={32} fill="white" />
                </button>
              )}
              <div className="absolute inset-0 bg-black/10 dark:bg-black/30" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-center text-gray-500 dark:text-gray-400 font-medium">
            Video dimostrativo - Metti il tuo file in /public/demo.mp4
          </p>
        </div>
      </div>
    </section>
  );
}
