import { Container } from "./Container";
import { Section } from "./Section";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { landingContent } from "@/content/landing";

export function FAQ() {
  const { title, items } = landingContent.faq;
  return (
    <Section id="faq">
      <Container>
        <h2 className="landing-heading text-center">{title}</h2>
        <Accordion className="mx-auto mt-8 max-w-3xl">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
}
