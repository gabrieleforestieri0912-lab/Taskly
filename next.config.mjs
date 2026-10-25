/** @type {import('next').NextConfig} */

// Build DESKTOP in modalità "backend remoto": se env DESKTOP_REMOTE_API_URL è
// impostata a build time, /api/* viene riscritta su quel deployment (il codice
// e le segreti restano SOLO sul sito online; l'utente desktop non ha chiavi).
// Same-origin per il renderer su localhost:3000 → nessun CORS/cookie di terzi.
// Default (vuoto): nessun rewrite, le API locali servono tutto (comportamento
// attuale — self-contained con .env aggiornato).
const remoteApi =
  process.env.DESKTOP_REMOTE_API_URL?.trim().replace(/\/+$/, "") || "";

// output: "standalone" produce .next/standalone (server.js + node_modules
// minimi): l'app desktop lo impacchetta via extraResources e lo avvia come
// child process ("node server.js"). Su VERCEL il runtime Next NON funziona
// con standalone (cerca .next/next-server.js.nft.json, ENOENT in build):
// lì serve l'output default, quindi disattivo standalone se VERCEL=1.
const isVercelBuild = process.env.VERCEL === "1";
const nextConfig = {
  reactCompiler: true,
  output: isVercelBuild ? undefined : "standalone",
  async rewrites() {
    if (!remoteApi) return [];
    // beforeFiles: il rewrite deve avere la priorità sulle route locali
    // (afterFiles le lascerebbe "cercare" il file /api/*/route.ts prima).
    return {
      beforeFiles: [
        { source: "/api/:path*", destination: `${remoteApi}/api/:path*` },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
