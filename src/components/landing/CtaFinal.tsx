import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "./Container";
import { Section } from "./Section";
import { landingContent } from "@/content/landing";

export function CtaFinal() {
  const { title, description, cta, reassurance } = landingContent.ctaFinal;
  return (
    <Section variant="dark">
      <Container className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-2xl mx-auto">{title}</h2>
        <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">{description}</p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/signup"
            className="inline-flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-semibold text-[#7b39fc] hover:bg-gray-100"
          >
            {cta} <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-white/60">{reassurance}</p>
        </div>
      </Container>
    </Section>
  );
}
