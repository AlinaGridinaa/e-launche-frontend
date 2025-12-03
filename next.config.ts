import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Відключаємо Turbopack
  turbopack: undefined,
  
  // Додаємо headers для Open Graph зображень
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
