"use client";

import { type User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const lang = normalizeLang(searchParams.get("lang") ?? "en");
  const searchString = searchParams.toString();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, searchString]);

  function handleLangChange(nextLang: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLang);
    router.push(`${pathname}?${params.toString()}`);
  }

  const homeLabel = lang === "it" ? "Home" : lang === "es" ? "Inicio" : lang === "de" ? "Start" : lang === "fr" ? "Accueil" : "Home";
  const aboutLabel = lang === "it" ? "About" : lang === "es" ? "Acerca de" : lang === "de" ? "Über" : lang === "fr" ? "À propos" : "About";
  const dashboardLabel = lang === "it" ? "Dashboard" : lang === "es" ? "Panel" : lang === "de" ? "Dashboard" : lang === "fr" ? "Tableau de bord" : "Dashboard";
  const loginLabel = lang === "it" ? "Login" : lang === "es" ? "Acceso" : lang === "de" ? "Login" : lang === "fr" ? "Connexion" : "Login";
  const registerLabel = lang === "it" ? "Registrati" : lang === "es" ? "Registro" : lang === "de" ? "Registrieren" : lang === "fr" ? "Inscription" : "Register";

  const topbarLinks = user
    ? [
        { href: hrefWithLang("/dashboard", lang), label: dashboardLabel },
        { href: hrefWithLang("/about", lang), label: aboutLabel },
      ]
    : [
        { href: hrefWithLang("/register", lang), label: registerLabel },
        { href: hrefWithLang("/login", lang), label: loginLabel },
        { href: hrefWithLang("/about", lang), label: aboutLabel },
      ];

  return (
    <>
      <header className="app-header sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="app-nav-link cursor-pointer rounded-md px-2 py-1 text-lg font-semibold transition-colors"
            >
              ≡
            </button>
            <Link href={hrefWithLang("/", lang)} className="app-nav-link flex items-center gap-2 rounded-md px-2 py-1 font-semibold transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/accv-logo.svg" alt="CaliACCSetupsViewer" className="h-6 w-6" />
              <span>{homeLabel}</span>
            </Link>
          </div>

          <div className="hidden items-center gap-2 text-sm md:flex">
            <Link href={hrefWithLang("/", lang)} className="app-nav-link flex items-center gap-2 rounded-md px-2 py-1 font-semibold transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/accv-logo.svg" alt="CaliACCSetupsViewer" className="h-6 w-6" />
              <span>{homeLabel}</span>
            </Link>
            {topbarLinks.map((item) => (
              <Link key={item.href} href={item.href} className="app-nav-link rounded-md px-2 py-1 font-semibold transition-colors">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
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

      {menuOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <Link href={hrefWithLang("/", lang)} className="app-nav-link flex items-center gap-2 rounded-md px-2 py-1 font-semibold transition-colors" onClick={() => setMenuOpen(false)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/accv-logo.svg" alt="CaliACCSetupsViewer" className="h-6 w-6" />
                <span>{homeLabel}</span>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="app-nav-link cursor-pointer rounded-md px-2 py-1 text-lg font-semibold transition-colors"
              >
                x
              </button>
            </div>

            <nav className="grid gap-1">
              {topbarLinks.map((item) => (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="app-nav-link rounded-md px-2 py-2 text-sm font-semibold transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 grid gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-700">
              <label className="sr-only" htmlFor="lang-select-mobile">
                Language
              </label>
              <select
                id="lang-select-mobile"
                value={lang}
                onChange={(event) => handleLangChange(event.target.value)}
                className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {Object.entries(LANG_OPTIONS).map(([code, option]) => (
                  <option key={`mobile-${code}`} value={code}>
                    {option.flag} {option.label}
                  </option>
                ))}
              </select>
              <div className="flex justify-start">
                <ThemeToggle />
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
