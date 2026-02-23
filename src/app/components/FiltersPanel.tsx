"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getUiText, type Lang } from "@/lib/i18n";

type FilterValue = {
  key: string;
  label: string;
};

const CAR_CATEGORIES = ["gt3", "gt4", "gt2", "cup", "challenge", "st", "other"] as const;
type CarCategory = (typeof CAR_CATEGORIES)[number];

type FiltersPanelProps = {
  carValues: FilterValue[];
  trackValues: FilterValue[];
  selectedCar: string;
  selectedTrack: string;
  selectedCarClass: CarCategory;
  classByCar: Record<string, CarCategory>;
  lang: Lang;
};

function buildHref(car: string, track: string, file: string, carClass: string, lang: string): string {
  const params = new URLSearchParams();
  if (car) params.set("car", car);
  if (track) params.set("track", track);
  if (file) params.set("file", file);
  if (carClass) params.set("carClass", carClass);
  if (lang) params.set("lang", lang);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function categoryLabel(category: CarCategory): string {
  return category.toUpperCase();
}

const CAR_SEARCH_STORAGE_KEY = "cali_acc_search_car";
const TRACK_SEARCH_STORAGE_KEY = "cali_acc_search_track";

export default function FiltersPanel({
  carValues,
  trackValues,
  selectedCar,
  selectedTrack,
  selectedCarClass,
  classByCar,
  lang,
}: FiltersPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = getUiText(lang);
  const [isPending, startTransition] = useTransition();

  const [carSearch, setCarSearch] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.sessionStorage.getItem(CAR_SEARCH_STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [trackSearch, setTrackSearch] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.sessionStorage.getItem(TRACK_SEARCH_STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [draftCarClass, setDraftCarClass] = useState<CarCategory>(selectedCarClass);
  const [draftCar, setDraftCar] = useState(selectedCar);
  const [draftTrack, setDraftTrack] = useState(selectedTrack);

  const carSearchNormalized = normalize(carSearch);
  const trackSearchNormalized = normalize(trackSearch);

  const tabs = useMemo(
    () => CAR_CATEGORIES.filter((category) => carValues.some((item) => classByCar[item.key] === category)),
    [carValues, classByCar],
  );

  const visibleCars = useMemo(
    () =>
      carValues.filter((item) => {
        if (classByCar[item.key] !== draftCarClass) return false;
        if (!carSearchNormalized) return true;
        return item.label.toLowerCase().includes(carSearchNormalized);
      }),
    [carValues, classByCar, draftCarClass, carSearchNormalized],
  );

  const visibleTracks = useMemo(
    () =>
      trackValues.filter((item) => {
        if (!trackSearchNormalized) return true;
        return item.label.toLowerCase().includes(trackSearchNormalized);
      }),
    [trackValues, trackSearchNormalized],
  );

  const selectedCarLabel = carValues.find((item) => item.key === draftCar)?.label ?? "";
  const selectedTrackLabel = trackValues.find((item) => item.key === draftTrack)?.label ?? "";
  const selectedSummary = [selectedCarLabel, selectedTrackLabel].filter(Boolean).join(" / ");
  const applyButtonLabel = selectedSummary ? `${t.searchSelectionPrefix} ${selectedSummary}` : t.searchAllSetups;
  const isApplyDisabled = !draftCar && !draftTrack;

  function persistSearch(carValue: string, trackValue: string) {
    try {
      window.sessionStorage.setItem(CAR_SEARCH_STORAGE_KEY, carValue);
      window.sessionStorage.setItem(TRACK_SEARCH_STORAGE_KEY, trackValue);
    } catch {
      // ignore storage failures
    }
  }

  function handleApplyFilters() {
    if (isApplyDisabled) return;
    const nextHref = buildHref(draftCar, draftTrack, "", draftCarClass, lang);
    const currentSearch = searchParams.toString();
    const currentHref = currentSearch ? `${pathname}?${currentSearch}` : pathname;
    if (nextHref === currentHref) {
      return;
    }
    persistSearch(carSearch, trackSearch);
    startTransition(() => {
      router.push(nextHref);
    });
  }

  function handleResetAll() {
    setDraftCarClass("gt3");
    setDraftCar("");
    setDraftTrack("");
    setCarSearch("");
    setTrackSearch("");
    persistSearch("", "");
    const nextHref = `/?lang=${lang}`;
    const currentSearch = searchParams.toString();
    const currentHref = currentSearch ? `${pathname}?${currentSearch}` : pathname;
    if (nextHref === currentHref) {
      return;
    }
    startTransition(() => {
      router.push(nextHref);
    });
  }

  return (
    <section className="mb-6">
      {isPending ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#23a936]/25 border-t-[#23a936]" />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-900">{t.filterCar}</h2>
            <button
              type="button"
              onClick={() => setDraftCar("")}
              className="cursor-pointer rounded-md bg-[#23a936] px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#1f962f]"
            >
              {t.reset}
            </button>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = tab === draftCarClass;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setDraftCarClass(tab);
                    if (draftCar && classByCar[draftCar] !== tab) {
                      setDraftCar("");
                    }
                  }}
                  className={[
                    "cursor-pointer rounded-lg border px-3 py-1 text-xs font-semibold transition-colors",
                    active
                      ? "border-[#23a936] bg-[#23a936] text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-[#23a936]",
                  ].join(" ")}
                >
                  {categoryLabel(tab)}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={carSearch}
            onChange={(event) => {
              const next = event.target.value;
              setCarSearch(next);
              persistSearch(next, trackSearch);
            }}
            placeholder={t.searchCarPlaceholder}
            className="mb-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-300 focus:ring-2"
          />

          <p className="mb-2 text-xs text-zinc-500">
            {t.resultsCount}: {visibleCars.length}
          </p>
          <div className="max-h-64 overflow-y-auto pr-1 sm:max-h-72">
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleCars.map((value) => {
                const active = value.key === draftCar;
                return (
                  <button
                    key={value.key}
                    type="button"
                    onClick={() => setDraftCar(value.key === draftCar ? "" : value.key)}
                    className={[
                      "cursor-pointer rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors",
                      active
                        ? "border-[#23a936] bg-[#23a936] text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-[#23a936]",
                    ].join(" ")}
                  >
                    {value.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-900">{t.filterTrack}</h2>
            <button
              type="button"
              onClick={() => setDraftTrack("")}
              className="cursor-pointer rounded-md bg-[#23a936] px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#1f962f]"
            >
              {t.reset}
            </button>
          </div>

          <input
            type="text"
            value={trackSearch}
            onChange={(event) => {
              const next = event.target.value;
              setTrackSearch(next);
              persistSearch(carSearch, next);
            }}
            placeholder={t.searchTrackPlaceholder}
            className="mb-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-300 focus:ring-2"
          />

          <p className="mb-2 text-xs text-zinc-500">
            {t.resultsCount}: {visibleTracks.length}
          </p>
          <div className="max-h-64 overflow-y-auto pr-1 sm:max-h-72">
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleTracks.map((value) => {
                const active = value.key === draftTrack;
                return (
                  <button
                    key={value.key}
                    type="button"
                    onClick={() => setDraftTrack(value.key === draftTrack ? "" : value.key)}
                    className={[
                      "cursor-pointer rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors",
                      active
                        ? "border-[#23a936] bg-[#23a936] text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-[#23a936]",
                    ].join(" ")}
                  >
                    {value.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleResetAll}
          className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {t.reset}
        </button>
        <button
          type="button"
          onClick={handleApplyFilters}
          disabled={isApplyDisabled}
          className={[
            "rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors",
            isApplyDisabled
              ? "cursor-not-allowed bg-[#23a936]/50"
              : "cursor-pointer bg-[#23a936] hover:bg-[#1f962f]",
          ].join(" ")}
        >
          {applyButtonLabel}
        </button>
      </div>
    </section>
  );
}
