import { Container } from "./Container";
import { Section } from "./Section";
import { landingContent } from "@/content/landing";
import { HardDrive, MessageSquare, FileText, Calendar, Github, Palette } from "lucide-react";

const integrationIcons: Record<string, typeof HardDrive> = {
  "Google Drive": HardDrive,
  Slack: MessageSquare,
  Notion: FileText,
  Calendar: Calendar,
  GitHub: Github,
  Figma: Palette,
};

export function Integrations() {
  const { title, description, items } = landingContent.integrations;
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="landing-heading">{title}</h2>
          <p className="landing-body mt-4">{description}</p>
          <p className="mt-2 text-xs text-muted-foreground">Loghi testuali generici — nessun asset di terze parti (D aperto).</p>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((name) => {
            const Icon = integrationIcons[name] ?? HardDrive;
            return (
              <div
                key={name}
                className="flex flex-col items-center gap-2 rounded-xl border border-black/5 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="landing-icon-wrap">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{name}</span>
                <span className="text-xs text-muted-foreground">Integrazione</span>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
