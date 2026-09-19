import { Container } from "./Container";
import { Section } from "./Section";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { landingContent } from "@/content/landing";
import { Briefcase, Users, GraduationCap, Rocket } from "lucide-react";

const personaIcons: Record<string, typeof Briefcase> = {
  Freelance: Briefcase,
  "Team piccoli": Users,
  Studenti: GraduationCap,
  Startup: Rocket,
};

export function UseCases() {
  const { eyebrow, title, cases } = landingContent.useCases;
    return (
    <Section id="casi-uso">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="landing-eyebrow">{eyebrow}</span>
          <h2 className="landing-heading-lg">{title}</h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cases.map((c) => {
            const Icon = personaIcons[c.persona] ?? Briefcase;
            return (
              <StaggerItem key={c.persona} className="landing-card flex flex-col hover:-translate-y-1 transition-transform">
                <div className="landing-icon-wrap">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">{c.persona}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                <div className="mt-4 rounded-full bg-[#f4f0fd] dark:bg-[#7b39fc]/20 px-3 py-1.5 text-xs font-medium text-[#7b39fc] dark:text-[#a67cff] text-center">
                  {c.flow}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}
