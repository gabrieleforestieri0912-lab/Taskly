import { landingContent } from "@/content/landing";

/**
 * Fase 0 — placeholder.
 * La landing completa verrà costruita per fasi.
 * Questa route verifica che la struttura marketing sia risolta correttamente.
 */
export default function MarketingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="text-3xl font-bold">Taskly — Marketing (Fase 0)</h1>
      <p className="mt-4 text-muted-foreground">{landingContent.meta.description}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Struttura pronta. Le sezioni verranno implementate nelle fasi successive.
      </p>
    </main>
  );
}
