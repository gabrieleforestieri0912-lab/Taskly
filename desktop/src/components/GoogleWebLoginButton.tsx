"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

function isElectron(): boolean {
  try {
    return Boolean((window as any)?.electronAPI?.isElectron);
  } catch {
    return false;
  }
}

async function openInBrowser(url: string): Promise<void> {
  try {
    const api = (window as any)?.electronAPI;
    if (api?.openExternal) {
      await api.openExternal(url);
      return;
    }
  } catch {}
  // Fallback (dev nel browser): nuova scheda
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Bottone "Continua con Google" via browser web esterno.
 * Dentro Electron il bottone GIS incorporato (@react-oauth/google) non
 * funziona (Google blocca i webview embedded: 403 disallowed_useragent),
 * quindi il flusso OAuth avviene nel browser di sistema con redirect
 * loopback sul backend locale; questa componente fa polling del risultato.
 */
export default function GoogleWebLoginButton({
  text = "signup_with",
  onError,
}: {
  text?: "signup_with" | "continue_with";
  onError?: (message: string) => void;
}) {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [status, setStatus] = useState("");
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const fail = (message: string) => {
    if (cancelledRef.current) return;
    setWaiting(false);
    setStatus("");
    if (onError) onError(message);
  };

  const handleClick = async () => {
    if (waiting) return;
    setWaiting(true);
    setStatus("Apertura del browser in corso…");
    try {
      const { data } = await axios.get("/api/auth/google/start", {
        params: { format: "json" },
      });
      const { url, state } = data || {};
      if (!url || !state) {
        fail("Avvio login Google fallito. Riprova.");
        return;
      }
      await openInBrowser(url);
      if (cancelledRef.current) return;
      setStatus("Completa l'accesso nel browser, poi torna qui…");

      // Polling del risultato (il browser esterno rimanda il code al backend)
      const deadline = Date.now() + 5 * 60 * 1000;
      while (Date.now() < deadline) {
        if (cancelledRef.current) return;
        await new Promise((r) => setTimeout(r, 2000));
        if (cancelledRef.current) return;
        try {
          const res = await axios.get("/api/auth/google/result", {
            params: { state },
          });
          if (res.data?.done && res.data?.token) {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            router.push("/dashboard");
            return;
          }
        } catch (err: any) {
          const statusCode = err?.response?.status;
          if (statusCode === 410) {
            fail("Sessione scaduta. Riprova il login.");
            return;
          }
          if (statusCode !== 404) {
            fail(err?.response?.data?.message || "Accesso Google fallito. Riprova.");
            return;
          }
          // 404 = in attesa del completamento nel browser: continua il polling
        }
      }
      fail("Tempo scaduto. Riprova il login.");
    } catch (err: any) {
      fail(err?.response?.data?.message || "Avvio login Google fallito. Riprova.");
    }
  };

  const cancel = () => {
    cancelledRef.current = true;
    // Permette un nuovo tentativo: resetta il flag di cancellazione
    setTimeout(() => {
      cancelledRef.current = false;
    }, 0);
    setWaiting(false);
    setStatus("");
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {!waiting ? (
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45c-.28 1.48-1.12 2.73-2.4 3.58v2.97h3.88c2.27-2.09 3.57-5.17 3.57-8.74z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-2.97c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.07C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.29 14.32c-.24-.72-.38-1.49-.38-2.32s.14-1.6.38-2.32V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l4-3.07z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l4 3.07c.94-2.84 3.59-4.93 6.71-4.93z"
            />
          </svg>
          {text === "signup_with" ? "Registrati con Google" : "Continua con Google"}
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#7b39fc] animate-spin" />
            <span>{status || "In attesa del browser…"}</span>
          </div>
          <button
            type="button"
            onClick={cancel}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Annulla
          </button>
        </>
      )}
      {isElectron() ? (
        <p className="text-[11px] text-gray-400 text-center">
          L&apos;accesso Google avviene nel browser per motivi di sicurezza.
        </p>
      ) : null}
    </div>
  );
}
