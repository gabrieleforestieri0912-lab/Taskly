import { CheckSquare, Target, MessageCircle, Bell, Zap, Search, LucideIcon } from "lucide-react";
import { Container } from "./Container";
import { Section } from "./Section";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { landingContent } from "@/content/landing";

const iconMap: Record<string, LucideIcon> = {
  CheckSquare,
  Target,
  MessageCircle,
  Bell,
  Zap,
  Search,
};

export function BentoGrid() {
  const { title, items } = landingContent.bento;

  return (
    <Section>
      <Container>
        <Reveal>
          <h2 className="landing-heading text-center max-w-2xl mx-auto">{title}</h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-6 md:grid-cols-12">
          {items.map((item, idx) => {
            const Icon = iconMap[item.icon] ?? CheckSquare;
            const span = idx === 0 ? "md:col-span-7" : idx === 1 ? "md:col-span-5" : idx === 2 ? "md:col-span-5" : idx === 3 ? "md:col-span-7" : "md:col-span-6";
            return (
              <StaggerItem
                key={item.title}
                className={`landing-card flex flex-col ${span} min-h-[180px] hover:-translate-y-1 hover:shadow-xl transition-transform`}
              >
                <div className="landing-icon-wrap">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                {/* mini-visual opzionale per alcune card */}
                {idx === 0 && (
                  <div className="mt-4 flex gap-2">
                    <span className="h-2 w-12 rounded-full bg-[#7b39fc]/20" />
                    <span className="h-2 w-8 rounded-full bg-[#7b39fc]/10" />
                  </div>
                )}
                {idx === 3 && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Promemoria attivo
                  </div>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}
