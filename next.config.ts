import type { NextConfig } from "next";
// @ts-ignore
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  // Відключаємо Turbopack для сумісності з next-pwa
  turbopack: undefined,
};

export default withPWA({
  dest: "public",
  register: false, // Вимикаємо автоматичну реєстрацію - ми реєструємо sw-custom.js вручну
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  sw: "sw-custom.js", // Використовуємо наш кастомний Service Worker
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})(nextConfig);
