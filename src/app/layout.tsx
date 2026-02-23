import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";
import PwaRegister from "./components/PwaRegister";
import InstallPrompt from "./components/InstallPrompt";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaliACCSetupsViewer",
  description: "CaliACCSetupsViewer web application",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CaliACCSetupsViewer",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#23a936",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var saved = localStorage.getItem("theme");
                  var isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
                  if (isDark) document.documentElement.classList.add("dark");
                  else document.documentElement.classList.remove("dark");
                } catch (e) {}
              })();
            `,
          }}
        />
        <PwaRegister />
        <InstallPrompt />
        <Suspense fallback={<div className="h-[57px] border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950" />}>
          <AppHeader />
        </Suspense>
        <div className="flex-1">{children}</div>
        <Suspense fallback={<div className="h-[61px] border-t border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950" />}>
          <AppFooter />
        </Suspense>
      </body>
    </html>
  );
}
