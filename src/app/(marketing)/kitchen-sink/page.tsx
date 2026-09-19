import { Container } from "@/components/landing/Container";
import { Section } from "@/components/landing/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function KitchenSink() {
  return (
    <div>
      <Container className="py-8">
        <h1 className="text-4xl font-bold">Kitchen Sink — Design Tokens</h1>
        <p className="text-muted-foreground mt-2">Verifica token Phase 1</p>
      </Container>

      <Section>
        <Container>
          <h2 className="landing-heading mb-6">Tipografia</h2>
          <div className="space-y-4">
            <p className="text-5xl font-extrabold tracking-[-0.035em]">Display 72px — Organizza il tuo lavoro</p>
            <h1 className="landing-heading-lg">Heading LG — H1 48px</h1>
            <h2 className="landing-heading">Heading — H2 36px</h2>
            <p className="landing-body max-w-prose">Body — Lorem ipsum con max-width leggibile (65ch), leading 1.7, tracking -0.011em. Colore muted per testi lunghi.</p>
            <p className="text-sm text-muted-foreground">Small — 14px muted</p>
          </div>
        </Container>
      </Section>

      <Section variant="alt">
        <Container>
          <h2 className="landing-heading mb-6">Bottoni</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Primary (default)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <span className="landing-btn-primary">landing-btn-primary</span>
            <span className="landing-btn-secondary">landing-btn-secondary</span>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="landing-heading mb-6">Badge & Card</h2>
          <div className="flex gap-2 mb-6">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <span className="landing-eyebrow">Eyebrow Taskly</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="landing-card">
              <CardHeader>
                <CardTitle>Card shadcn</CardTitle>
                <CardDescription>Descrizione card</CardDescription>
              </CardHeader>
              <CardContent>Contenuto</CardContent>
            </Card>
            <div className="landing-card">
              <div className="landing-icon-wrap mb-3">★</div>
              <h3 className="font-semibold">Landing Card</h3>
              <p className="text-sm text-muted-foreground">Stile Taskly</p>
            </div>
            <div className="landing-stat-card">
              <p className="text-2xl font-bold">42</p>
              <p className="text-sm">Stat card</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="alt">
        <Container>
          <h2 className="landing-heading mb-4">Colori Brand</h2>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {["#7b39fc", "#a67cff", "#5B5BD6", "#2b2344", "#f6f7f9", "#0a0a0a", "#ffffff"].map((c) => (
              <div key={c} className="h-20 rounded-xl border" style={{ background: c }} title={c} />
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Brand: #5B5BD6 base, #7b39fc primary, neutri caldi</p>
        </Container>
      </Section>
    </div>
  );
}
