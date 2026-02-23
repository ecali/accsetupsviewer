import type { Metadata } from "next";
import { Suspense } from "react";
import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaliACCSetupsViewer",
  description: "CaliACCSetupsViewer web application",
  icons: {
    icon: "/accv-logo.svg",
  },
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
