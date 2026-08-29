"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import DashboardShowcase from "../components/DashboardShowcase";
import ValueProposition from "../components/ValueProposition";
import GettingStarted from "../components/GettingStarted";
import ProblemSolution from "../components/ProblemSolution";
import ProductDemo from "../components/ProductDemo";
import SocialProof from "../components/SocialProof";
import UseCases from "../components/UseCases";
import Comparison from "../components/Comparison";
import HowItWorks from "../components/HowItWorks";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import CtaBanner from "../components/CtaBanner";
import Footer from "../components/Footer";
import { ScrollReveal } from "../components/UIComponents";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const handleStart = () => {
    router.push("/register");
  };

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-shell min-h-screen bg-white dark:bg-black">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <Hero onStart={handleStart} onDiscover={() => handleScrollTo("value")} />

      <DashboardShowcase />

      <ScrollReveal>
        <section id="value" className="landing-section">
          <ValueProposition />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <section id="getting-started" className="landing-section">
          <GettingStarted />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="demo" className="landing-section">
          <ProductDemo />
        </section>
      </ScrollReveal>

      <ScrollReveal direction="left">
        <section id="problem-solution" className="landing-section">
          <ProblemSolution />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="social-proof" className="landing-section">
          <SocialProof />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="use-cases" className="landing-section">
          <UseCases />
        </section>
      </ScrollReveal>

      <ScrollReveal direction="up">
        <section id="comparison" className="landing-section">
          <Comparison />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="features" className="landing-section">
          <HowItWorks />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="pricing" className="landing-section">
          <Pricing />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="faq" className="landing-section">
          <FAQ />
        </section>
      </ScrollReveal>

      <CtaBanner />

      <Footer />
    </div>
  );
}
