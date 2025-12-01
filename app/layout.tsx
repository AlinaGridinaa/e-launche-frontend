import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

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
  description: "Магічна платформа навчання з геймифікацією",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Академія Запусків",
  },
  icons: {
    icon: "/icons/192x192_мінімальний_розмір_для_Android.png",
    apple: "/icons/180x180 - iOS (apple-touch-icon).png",
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
  <link rel="icon" href="/icons/192x192_мінімальний_розмір_для_Android.png" />
  <link rel="apple-touch-icon" href="/icons/180x180 - iOS (apple-touch-icon).png" />
  <link rel="apple-touch-icon" sizes="192x192" href="/icons/192x192_мінімальний_розмір_для_Android.png" />
  <link rel="apple-touch-icon" sizes="512x512" href="/icons/512x512_рекомендований_розмір_для_splash_screen.png" />
        <meta name="theme-color" content="#2466FF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Академія Запусків" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
