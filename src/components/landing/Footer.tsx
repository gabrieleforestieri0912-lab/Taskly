import Link from "next/link";
import { Container } from "./Container";
import { landingContent } from "@/content/landing";

export function Footer() {
  const { product, resources, company, legal, copyright } = landingContent.footer;

  const columns = [
    { title: "Prodotto", items: product },
    { title: "Risorse", items: resources },
    { title: "Azienda", items: company },
    { title: "Legale", items: legal },
  ];

  return (
    <footer className="bg-[#f6f7f9] dark:bg-[#0a0a0a] border-t border-black/5 dark:border-white/10">
      <Container className="py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm font-bold">Taskly</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{copyright}</span>
        </div>
      </Container>
    </footer>
  );
}
