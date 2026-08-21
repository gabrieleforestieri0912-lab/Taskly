/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // No rewrites needed: /api requests are served directly by the Next.js
  // API routes under src/app/api (the standalone Express server was removed).
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
