"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { LANG_OPTIONS, normalizeLang } from "@/lib/i18n";

function hrefWithLang(path: string, lang: string): string {
  const params = new URLSearchParams();
  params.set("lang", lang);
  return `${path}?${params.toString()}`;
}

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const lang = normalizeLang(searchParams.get("lang") ?? "en");

  function handleLangChange(nextLang: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLang);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <header className="app-header sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        <div className="flex items-center gap-2 text-sm">
          <Link href={hrefWithLang("/", lang)} className="app-nav-link flex items-center gap-2 rounded-md px-2 py-1 font-semibold transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/accv-logo.svg" alt="CaliACCSetupsViewer" className="h-6 w-6" />
            <span>{lang === "it" ? "Home" : lang === "es" ? "Inicio" : lang === "de" ? "Start" : lang === "fr" ? "Accueil" : "Home"}</span>
          </Link>
          <Link href={hrefWithLang("/about", lang)} className="app-nav-link rounded-md px-2 py-1 font-semibold transition-colors">
            {lang === "it" ? "About" : lang === "es" ? "Acerca de" : lang === "de" ? "Über" : lang === "fr" ? "À propos" : "About"}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="lang-select">
            Language
          </label>
          <select
            id="lang-select"
            value={lang}
            onChange={(event) => handleLangChange(event.target.value)}
            className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {Object.entries(LANG_OPTIONS).map(([code, option]) => (
              <option key={code} value={code}>
                {option.flag} {option.label}
              </option>
            ))}
          </select>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
