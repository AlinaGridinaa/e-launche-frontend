import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Академія Запусків - Платформа навчання",
  description: "Магічна платформа навчання з геймифікацією. Навчайтеся створювати та запускати власні проєкти з досвідченими експертами.",
  keywords: ["академія запусків", "навчання онлайн", "запуск проєктів", "геймифікація", "онлайн курси", "e-learning"],
  authors: [{ name: "Академія Запусків" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Академія Запусків",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: "https://e-launch.net",
    siteName: "Академія Запусків",
    title: "Академія Запусків - Платформа навчання",
    description: "Магічна платформа навчання з геймифікацією. Навчайтеся створювати та запускати власні проєкти з досвідченими експертами.",
    images: [
      {
        url: "/images/Banner.png",
        width: 1200,
        height: 630,
        alt: "Академія Запусків",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Академія Запусків - Платформа навчання",
    description: "Магічна платформа навчання з геймифікацією. Навчайтеся створювати та запускати власні проєкти з досвідченими експертами.",
    images: ["/images/Banner.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2466FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <head>
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        <meta name="theme-color" content="#2466FF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Академія Запусків" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegistration />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
