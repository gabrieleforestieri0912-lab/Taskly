/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  reactCompiler: true,
  async rewrites() {
    // The frontend (npm run dev) and the API server (npm run server) are
    // separate processes. Proxy every /api request from the frontend origin
    // to the Express API server. Override the target with API_URL or
    // NEXT_PUBLIC_API_URL (default http://localhost:3001).
    const apiServer =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      `http://localhost:${process.env.API_PORT || 3001}`;
    return [
      {
        source: "/api/:path*",
        destination: `${apiServer}/api/:path*`,
      },
    ];
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
