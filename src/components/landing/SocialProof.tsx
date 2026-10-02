import { Container } from "./Container";
import { landingContent } from "@/content/landing";

export function SocialProof() {
  const { title, description } = landingContent.socialProof;
  return (
    <section className="py-8 bg-white dark:bg-[#0e0e0e] border-y border-black/5 dark:border-white/5">
      <Container className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2">
          {/* Marchi testuali, niente placeholder */}
          {["Freelance", "Piccoli team", "Studenti", "Startup"].map((c) => (
            <span key={c} className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {c}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
