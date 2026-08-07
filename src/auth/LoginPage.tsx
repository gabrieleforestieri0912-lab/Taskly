"use client";

import React, { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Input } from "../components/UIComponents";
import { Rocket, ArrowLeft, Mail, Lock } from "lucide-react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      // Store token and user info
      localStorage.setItem("token", response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(response.data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Errore durante l'accesso. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: {
    credential?: string;
  }) => {
    setError("");
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/google", {
        credential: credentialResponse.credential,
      });

      localStorage.setItem("token", response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(response.data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Accesso Google fallito. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaff] dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7b39fc]/10 dark:bg-[#7b39fc]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#a67cff]/10 dark:bg-[#a67cff]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="fixed top-8 left-8 z-100">
        <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Torna alla home</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Image
                src="/taskly.png"
                alt="Taskly"
                width={48}
                height={48}
                className="rounded-2xl object-cover shadow-lg shadow-cyan-500/20"
                style={{ width: "48px", height: "48px" }}
              />
            </Link>
            <h2 className="font-instrument-serif text-4xl md:text-5xl leading-[1.1] tracking-[-0.02em] dark:text-white">
              Bentornato
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Accedi per gestire i tuoi obiettivi
            </p>
          </div>

          <Card className="border-white/40 dark:border-gray-700/40">
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1 text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input 
                      type="email" 
                      placeholder="nome@esempio.it" 
                      className="pl-12 py-3"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <a href="#" className="text-xs font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-400">
                      Dimenticata?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-12 py-3"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 text-lg mt-4 shadow-xl shadow-cyan-500/20"
                >
                  {loading ? "Accesso in corso..." : "Accedi"}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Oppure</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>

              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => setError("Accesso Google annullato o non riuscito.")}
                    theme="outline"
                    size="large"
                    shape="pill"
                    text="continue_with"
                  />
                </div>
              ) : (
                <p className="text-center text-xs text-amber-600 dark:text-amber-400">
                  Google Login non disponibile: configura `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
                </p>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/50 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Non hai ancora un account?{" "}
                  <Link
                    href="/register"
                    className="font-bold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 transition-colors"
                  >
                    Registrati ora
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
