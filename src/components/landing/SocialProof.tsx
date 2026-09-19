import { Container } from "./Container";
import { landingContent } from "@/content/landing";

export function SocialProof() {
  const { title, description } = landingContent.socialProof;
  return (
    <section className="py-8 bg-white dark:bg-[#0e0e0e] border-y border-black/5 dark:border-white/5">
      <Container className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-6 opacity-40">
          {/* Placeholder loghi generici testuali */}
          {["TODO: Cliente A", "TODO: Cliente B", "TODO: Cliente C"].map((c) => (
            <span key={c} className="text-sm font-medium border border-dashed border-muted-foreground/30 rounded-lg px-4 py-2">
              {c}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
