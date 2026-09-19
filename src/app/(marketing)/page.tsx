import { Hero } from "@/components/landing/Hero";
import { ViewsTabs } from "@/components/landing/ViewsTabs";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { SocialProof } from "@/components/landing/SocialProof";
import { UseCases } from "@/components/landing/UseCases";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Integrations } from "@/components/landing/Integrations";

export default function MarketingPage() {
  return (
    <>
      <Hero />
      <ViewsTabs />
      <BentoGrid />
      <SocialProof />
      <UseCases />
      <HowItWorks />
      <Integrations />
    </>
  );
}
