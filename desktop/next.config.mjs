/** @type {import('next').NextConfig} */
import fs from "node:fs";

const nextConfig = {
  turbopack: {
    // Canonicalize (realpath) so Turbopack containment checks match the real
    // filesystem path even when the user directory is a junction/symlink.
    root: fs.realpathSync(process.cwd()),
  },
  reactCompiler: true,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
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
