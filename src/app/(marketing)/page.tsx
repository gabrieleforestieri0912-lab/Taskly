import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { ViewsTabs } from "@/components/landing/ViewsTabs";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { SocialProof } from "@/components/landing/SocialProof";
import { UseCases } from "@/components/landing/UseCases";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Integrations } from "@/components/landing/Integrations";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CtaFinal } from "@/components/landing/CtaFinal";
import { landingContent } from "@/content/landing";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: landingContent.meta.title,
  description: landingContent.meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: SITE_NAME,
    title: landingContent.meta.title,
    description: landingContent.meta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: landingContent.meta.title,
    description: landingContent.meta.description,
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: landingContent.meta.description,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "it-IT",
};

export default function MarketingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <Hero />
      <ViewsTabs />
      <BentoGrid />
      <SocialProof />
      <UseCases />
      <HowItWorks />
      <Integrations />
      <Pricing />
      <FAQ />
      <CtaFinal />
    </>
  );
}
