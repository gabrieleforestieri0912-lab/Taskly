"use client";

import { useLanguage } from "../lib/LanguageContext";
import React, { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Input } from "../components/UIComponents";
import { Rocket, ArrowLeft, Mail, Lock } from "lucide-react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const { t } = useLanguage();
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
    <div className="min-h-screen bg-[#fcfaff] dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col relative overflow-hidden transition-colors duration-300">

      <div className="fixed top-8 left-8 z-100">
            <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#7b39fc] dark:hover:text-[#a67cff] transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">{t("auth.backToHome")}</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="font-inter text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-[-0.03em] dark:text-white">{t("auth.welcomeBack")}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{t("auth.loginSubtitle")}</p>
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
                      placeholder={t("auth.emailPlaceholder")} 
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
                    <a href="#" className="text-xs font-medium text-[#7b39fc] hover:text-[#8b4dff] dark:text-[#a67cff]">{t("auth.forgotPassword")}</a>
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
                  className="w-full py-4 text-lg mt-4 shadow-xl shadow-[#7b39fc]/30"
                >
                  {loading ? "Accesso in corso..." : "Accedi"}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">{t("auth.orDivider")}</span>
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
                <p className="text-center text-xs text-amber-600 dark:text-amber-400">{t("auth.googleLoginUnavailable")}</p>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/50 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Non hai ancora un account?{" "}
                  <Link
                    href="/register"
                    className="font-bold text-[#7b39fc] hover:text-[#8b4dff] dark:text-[#a67cff] transition-colors"
                  >{t("auth.registerNow")}</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
