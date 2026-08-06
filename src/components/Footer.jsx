import React from "react";
import Link from "next/link";
import { Mail, MapPin, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-[#f6f7f9] dark:bg-black text-gray-900 dark:text-gray-100 py-12 px-6 mt-auto transition-colors duration-300 border-t border-[#7b39fc]/10 dark:border-white/5"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Brand */}
        <div className="flex flex-col items-start">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-gradient-brand mb-2"
          >
            Taskly
          </Link>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed">
            Organizza il tuo tempo, riduci il rumore e rimani concentrato su ciò
            che conta.
          </p>

          <div className="flex items-center gap-4 mt-4" aria-hidden>
            <a
              href="mailto:info@taskly.com"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#7b39fc] dark:hover:text-[#a67cff] transition-colors text-sm"
            >
              <Mail size={16} /> info@taskly.com
            </a>
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
              <MapPin size={16} /> Italia
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-gray-400 dark:text-gray-500">
            Link Utili
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/#pricing"
                className="text-gray-600 dark:text-gray-300 hover:text-[#7b39fc] dark:hover:text-[#a67cff] transition-colors"
              >
                Prezzi
              </Link>
            </li>
            <li>
              <Link
                href="/docs"
                className="text-gray-600 dark:text-gray-300 hover:text-[#7b39fc] dark:hover:text-[#a67cff] transition-colors"
              >
                Documentazione
              </Link>
            </li>
            <li>
              <Link
                href="/support"
                className="text-gray-600 dark:text-gray-300 hover:text-[#7b39fc] dark:hover:text-[#a67cff] transition-colors"
              >
                Supporto
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-[#7b39fc] dark:hover:text-[#a67cff] transition-colors"
              >
                Accedi
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-gray-400 dark:text-gray-500">
            Seguici
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Seguici sui nostri canali per aggiornamenti e risorse.
          </p>

          <div
            className="flex items-center gap-4 mt-2"
            aria-label="Social links"
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Github size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 dark:text-gray-300 hover:text-sky-500 transition-colors"
            >
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-400 dark:text-gray-500 text-xs font-medium">
          © {new Date().getFullYear()} Taskly. Tutti i diritti riservati.
        </p>

        <div className="flex gap-6 text-xs">
          <Link
            href="/privacy"
            className="text-gray-400 dark:text-gray-500 hover:text-[#7b39fc] dark:hover:text-[#a67cff] transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-gray-400 dark:text-gray-500 hover:text-[#7b39fc] dark:hover:text-[#a67cff] transition-colors"
          >
            Termini
          </Link>
        </div>
      </div>
    </footer>
  );
}
