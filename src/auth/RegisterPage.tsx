"use client";

import { useLanguage } from "../lib/LanguageContext";
import React, { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Input } from "../components/UIComponents";
import { Rocket, ArrowLeft, Mail, Lock, User } from "lucide-react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      setSuccess(response.data.message);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Errore durante la registrazione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async (credentialResponse: {
    credential?: string;
  }) => {
    setError("");
    setSuccess("");
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
      setError(err.response?.data?.message || "Registrazione con Google fallita. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaff] dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col relative overflow-hidden transition-colors duration-300">

      <div className="fixed top-5 left-5 z-100">
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#7b39fc] dark:hover:text-[#a67cff] transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">{t("auth.backToHome")}</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h2 className="font-inter text-2xl md:text-3xl font-extrabold leading-[1.15] tracking-[-0.03em] dark:text-white">{t("auth.createAccount")}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">{t("auth.registerSubtitle")}</p>
          </div>

          <Card className="border-white/40 dark:border-gray-700/40">
            <CardContent className="p-4">
              {error && (
                <div className="mb-3 p-2.5 text-xs bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-3 p-2.5 text-xs bg-green-100 border border-green-400 text-green-700 rounded-xl text-sm">
                  {success} Reindirizzamento al login...
                </div>
              )}
              <form className="space-y-3.5" onSubmit={handleRegister}>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold ml-1 text-gray-700 dark:text-gray-300">{t("auth.fullName")}</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      type="text" 
                      placeholder={t("auth.fullNamePlaceholder")} 
                      className="pl-10 py-2.5 text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold ml-1 text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      type="email" 
                      placeholder={t("auth.emailPlaceholder")} 
                      className="pl-10 py-2.5 text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold ml-1 text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 py-2.5 text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 text-sm mt-3 shadow-lg shadow-[#7b39fc]/25"
                >
                  {loading ? "Registrazione in corso..." : "Registrati"}
                </Button>
              </form>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">{t("auth.orDivider")}</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>

              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleRegister}
                    onError={() => setError("Registrazione Google annullata o non riuscita.")}
                    theme="outline"
                    size="medium"
                    shape="pill"
                    text="signup_with"
                  />
                </div>
              ) : (
                <p className="text-center text-xs text-amber-600 dark:text-amber-400">{t("auth.googleSignupUnavailable")}</p>
              )}

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hai già un account?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-[#7b39fc] hover:text-[#8b4dff] dark:text-[#a67cff] transition-colors"
                  >{t("auth.signIn")}</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
