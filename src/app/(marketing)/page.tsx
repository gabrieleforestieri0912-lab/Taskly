import { Hero } from "@/components/landing/Hero";
import { ViewsTabs } from "@/components/landing/ViewsTabs";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { SocialProof } from "@/components/landing/SocialProof";

export default function MarketingPage() {
  return (
    <>
      <Hero />
      <ViewsTabs />
      <BentoGrid />
      <SocialProof />
    </>
  );
}
