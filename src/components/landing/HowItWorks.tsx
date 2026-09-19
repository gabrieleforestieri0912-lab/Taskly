import { Container } from "./Container";
import { Section } from "./Section";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { landingContent } from "@/content/landing";
import { ArrowRight } from "lucide-react";

export function HowItWorks() {
  const { title, steps } = landingContent.howItWorks;
  return (
    <Section variant="alt">
      <Container>
        <Reveal>
          <h2 className="landing-heading text-center">{title}</h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <StaggerItem key={step.n} className="relative flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7b39fc] text-white font-bold text-lg shadow-lg shadow-[#7b39fc]/20">
                {step.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">{step.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-8 -right-3 h-6 w-6 text-[#7b39fc]/30" aria-hidden="true" />
              )}
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
