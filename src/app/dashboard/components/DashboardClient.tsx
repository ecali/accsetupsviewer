"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ManualSetupRow = {
  id: string;
  car_key: string;
  track_key: string;
  setup_name: string;
  is_private: boolean;
  notes: string | null;
  created_at: string;
};

type LapTimeRow = {
  id: string;
  car_key: string;
  track_key: string;
  lap_time_ms: number;
  is_private: boolean;
  notes: string | null;
  created_at: string;
};

type FilterValue = {
  key: string;
  label: string;
};

type DashboardClientProps = {
  nickname: string;
};

type ToggleSwitchProps = {
  label: string;
  checked: boolean;
  onChange: (nextValue: boolean) => void;
};

function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[#23a936]" : "bg-zinc-300 dark:bg-zinc-600"}`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </label>
  );
}

export default function DashboardClient({ nickname }: DashboardClientProps) {
  const [setupJson, setSetupJson] = useState("{}");
  const [setupCar, setSetupCar] = useState("");
  const [setupTrack, setSetupTrack] = useState("");
  const [setupName, setSetupName] = useState("");
  const [setupNotes, setSetupNotes] = useState("");
  const [setupPrivate, setSetupPrivate] = useState(false);

  const [lapCar, setLapCar] = useState("");
  const [lapTrack, setLapTrack] = useState("");
  const [lapMinutes, setLapMinutes] = useState("");
  const [lapSeconds, setLapSeconds] = useState("");
  const [lapMilliseconds, setLapMilliseconds] = useState("");
  const [lapNotes, setLapNotes] = useState("");
  const [lapPrivate, setLapPrivate] = useState(false);

  const [manualSetups, setManualSetups] = useState<ManualSetupRow[]>([]);
  const [lapTimes, setLapTimes] = useState<LapTimeRow[]>([]);
  const [carOptions, setCarOptions] = useState<FilterValue[]>([]);
  const [trackOptions, setTrackOptions] = useState<FilterValue[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const secondsRef = useRef<HTMLInputElement>(null);
  const millisecondsRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  function sanitizeNumeric(value: string, maxLength: number) {
    return value.replace(/\D/g, "").slice(0, maxLength);
  }

  function formatLapTime(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
  }

  async function loadData() {
    const [setupsResult, lapsResult] = await Promise.all([
      supabase
        .from("setups_manual")
        .select("id,car_key,track_key,setup_name,is_private,notes,created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("lap_times")
        .select("id,car_key,track_key,lap_time_ms,is_private,notes,created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (setupsResult.error) {
      setError(setupsResult.error.message);
    } else {
      setManualSetups((setupsResult.data ?? []) as ManualSetupRow[]);
    }

    if (lapsResult.error) {
      setError(lapsResult.error.message);
    } else {
      setLapTimes((lapsResult.data ?? []) as LapTimeRow[]);
    }
  }

  async function loadCatalog() {
    setCatalogLoading(true);
    const response = await fetch("/api/setup-catalog", { cache: "force-cache" });
    const payload = (await response.json()) as {
      cars?: FilterValue[];
      tracks?: FilterValue[];
      error?: string;
    };
    setCatalogLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to load cars and tracks.");
      return;
    }

    setCarOptions(payload.cars ?? []);
    setTrackOptions(payload.tracks ?? []);
  }

  useEffect(() => {
    loadCatalog();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAddSetup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const cleanSetupName = setupName.trim();
    const cleanSetupJson = setupJson.trim();
    if (!cleanSetupName || !cleanSetupJson) {
      setLoading(false);
      setError("Setup name and setup JSON are required.");
      return;
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleanSetupJson);
    } catch {
      setLoading(false);
      setError("Setup JSON is not valid.");
      return;
    }

    const { error: insertError } = await supabase.from("setups_manual").insert({
      car_key: setupCar,
      track_key: setupTrack,
      setup_name: cleanSetupName,
      is_private: setupPrivate,
      notes: setupNotes || null,
      json_data: parsedJson,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSetupJson("{}");
    setSetupCar("");
    setSetupTrack("");
    setSetupName("");
    setSetupNotes("");
    setSetupPrivate(false);
    await loadData();
  }

  async function onAddLap(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const cleanMinutes = lapMinutes.trim();
    const cleanSeconds = lapSeconds.trim();
    const cleanMilliseconds = lapMilliseconds.trim();
    if (!cleanMinutes || !cleanSeconds || !cleanMilliseconds) {
      setLoading(false);
      setError("Lap time is required.");
      return;
    }

    const parsedMinutes = Number.parseInt(cleanMinutes, 10);
    const parsedSeconds = Number.parseInt(cleanSeconds, 10);
    const parsedMilliseconds = Number.parseInt(cleanMilliseconds, 10);

    if (!Number.isFinite(parsedMinutes) || !Number.isFinite(parsedSeconds) || !Number.isFinite(parsedMilliseconds)) {
      setLoading(false);
      setError("Lap time must contain only numbers.");
      return;
    }

    if (parsedMinutes < 0 || parsedSeconds < 0 || parsedSeconds > 59 || parsedMilliseconds < 0 || parsedMilliseconds > 999) {
      setLoading(false);
      setError("Lap time values are out of range.");
      return;
    }

    const parsedMs = parsedMinutes * 60000 + parsedSeconds * 1000 + parsedMilliseconds;
    if (parsedMs <= 0) {
      setLoading(false);
      setError("Lap time must be greater than 0.");
      return;
    }

    const { error: insertError } = await supabase.from("lap_times").insert({
      car_key: lapCar,
      track_key: lapTrack,
      lap_time_ms: parsedMs,
      is_private: lapPrivate,
      notes: lapNotes || null,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setLapCar("");
    setLapTrack("");
    setLapMinutes("");
    setLapSeconds("");
    setLapMilliseconds("");
    setLapNotes("");
    setLapPrivate(false);
    await loadData();
  }

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}

      <details open className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
        <summary className="cursor-pointer select-none text-lg font-semibold text-zinc-900 marker:text-[#23a936] dark:text-zinc-100">Add Lap Time</summary>
        <form className="mt-3 grid gap-3" onSubmit={onAddLap}>
          <fieldset className="grid gap-3">
            <select
              value={lapCar}
              onChange={(e) => setLapCar(e.target.value)}
              required
              className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            >
              <option value="" disabled>
                {catalogLoading ? "Loading cars..." : "Select car"}
              </option>
              {carOptions.map((car) => (
                <option key={car.key} value={car.key}>
                  {car.label}
                </option>
              ))}
            </select>
            <select
              value={lapTrack}
              onChange={(e) => setLapTrack(e.target.value)}
              required
              className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            >
              <option value="" disabled>
                {catalogLoading ? "Loading tracks..." : "Select track"}
              </option>
              {trackOptions.map((track) => (
                <option key={track.key} value={track.key}>
                  {track.label}
                </option>
              ))}
            </select>
            <div className="mx-auto grid w-full max-w-xs grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <input
                value={lapMinutes}
                onChange={(e) => {
                  const value = sanitizeNumeric(e.target.value, 2);
                  setLapMinutes(value);
                  if (value.length === 2) {
                    secondsRef.current?.focus();
                  }
                }}
                placeholder="mm"
                inputMode="numeric"
                required
                className="min-w-0 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-center text-sm dark:border-zinc-600 dark:bg-zinc-900"
              />
              <span className="text-zinc-500">:</span>
              <input
                ref={secondsRef}
                value={lapSeconds}
                onChange={(e) => {
                  const value = sanitizeNumeric(e.target.value, 2);
                  setLapSeconds(value);
                  if (value.length === 2) {
                    millisecondsRef.current?.focus();
                  }
                }}
                placeholder="ss"
                inputMode="numeric"
                required
                className="min-w-0 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-center text-sm dark:border-zinc-600 dark:bg-zinc-900"
              />
              <span className="text-zinc-500">.</span>
              <input
                ref={millisecondsRef}
                value={lapMilliseconds}
                onChange={(e) => setLapMilliseconds(sanitizeNumeric(e.target.value, 3))}
                placeholder="ms"
                inputMode="numeric"
                required
                className="min-w-0 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-center text-sm dark:border-zinc-600 dark:bg-zinc-900"
              />
            </div>
            <ToggleSwitch label="Private lap time" checked={lapPrivate} onChange={setLapPrivate} />
            <textarea value={lapNotes} onChange={(e) => setLapNotes(e.target.value)} placeholder="notes (optional)" className="min-h-20 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900" />
            <button
              disabled={loading || catalogLoading || !nickname.trim() || !lapCar || !lapTrack || !lapMinutes.trim() || !lapSeconds.trim() || !lapMilliseconds.trim()}
              className="rounded-lg bg-[#23a936] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save lap"}
            </button>
          </fieldset>
        </form>
      </details>

      <details className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
        <summary className="cursor-pointer select-none text-lg font-semibold text-zinc-900 marker:text-[#23a936] dark:text-zinc-100">Add Manual Setup</summary>
        <form className="mt-3 grid gap-3" onSubmit={onAddSetup}>
          <fieldset className="grid gap-3">
            <select
              value={setupCar}
              onChange={(e) => setSetupCar(e.target.value)}
              required
              className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            >
              <option value="" disabled>
                {catalogLoading ? "Loading cars..." : "Select car"}
              </option>
              {carOptions.map((car) => (
                <option key={car.key} value={car.key}>
                  {car.label}
                </option>
              ))}
            </select>
            <select
              value={setupTrack}
              onChange={(e) => setSetupTrack(e.target.value)}
              required
              className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            >
              <option value="" disabled>
                {catalogLoading ? "Loading tracks..." : "Select track"}
              </option>
              {trackOptions.map((track) => (
                <option key={track.key} value={track.key}>
                  {track.label}
                </option>
              ))}
            </select>
            <input value={setupName} onChange={(e) => setSetupName(e.target.value)} placeholder="setup name" required className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900" />
            <ToggleSwitch label="Private setup" checked={setupPrivate} onChange={setSetupPrivate} />
            <textarea value={setupNotes} onChange={(e) => setSetupNotes(e.target.value)} placeholder="notes (optional)" className="min-h-20 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900" />
            <textarea value={setupJson} onChange={(e) => setSetupJson(e.target.value)} placeholder='{"key":"value"}' required className="min-h-36 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-mono dark:border-zinc-600 dark:bg-zinc-900" />
            <button
              disabled={loading || catalogLoading || !nickname.trim() || !setupCar || !setupTrack || !setupName.trim() || !setupJson.trim()}
              className="rounded-lg bg-[#23a936] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save setup"}
            </button>
          </fieldset>
        </form>
      </details>

      {lapTimes.length > 0 ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Latest Lap Times</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {lapTimes.map((row) => (
              <li key={row.id} className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700">
                <p className="font-semibold">
                  {formatLapTime(row.lap_time_ms)}{" "}
                  <span className={`ml-2 rounded px-2 py-0.5 text-xs ${row.is_private ? "bg-zinc-700 text-white" : "bg-[#23a936]/15 text-[#1f7f2c]"}`}>
                    {row.is_private ? "Private" : "Public"}
                  </span>
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">{row.car_key} / {row.track_key}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {manualSetups.length > 0 ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Latest Manual Setups</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {manualSetups.map((row) => (
              <li key={row.id} className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700">
                <p className="font-semibold">
                  {row.setup_name}{" "}
                  <span className={`ml-2 rounded px-2 py-0.5 text-xs ${row.is_private ? "bg-zinc-700 text-white" : "bg-[#23a936]/15 text-[#1f7f2c]"}`}>
                    {row.is_private ? "Private" : "Public"}
                  </span>
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">{row.car_key} / {row.track_key}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
