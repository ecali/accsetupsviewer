"use client";

import { useSearchParams } from "next/navigation";
import { getUiText, normalizeLang } from "@/lib/i18n";

export default function AppFooter() {
  const searchParams = useSearchParams();
  const lang = normalizeLang(searchParams.get("lang") ?? "en");
  const t = getUiText(lang);

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 py-5 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
      <span>{t.developedWithBy} </span>
      <a href="https://github.com/ecali" target="_blank" rel="noreferrer" className="font-semibold text-[#23a936] underline">
        Cali
      </a>
    </footer>
  );
}
