import FiltersPanel from "./components/FiltersPanel";
import { getUiText, normalizeLang, type UiText } from "@/lib/i18n";
import SetupSelectLink from "./components/SetupSelectLink";

type GitHubTreeItem = {
  path: string;
  type: "blob" | "tree";
};

type SetupEntry = {
  path: string;
  car: string;
  track: string;
  filename: string;
  filenameLabel: string;
  carKey: string;
  trackKey: string;
  carLabel: string;
  trackLabel: string;
};

type KeyValueItem = {
  label: string;
  value: string;
};

type ParamRange = {
  min: number;
  max: number;
};

const CAR_CATEGORIES = ["gt3", "gt4", "gt2", "cup", "challenge", "st", "other"] as const;
type CarCategory = (typeof CAR_CATEGORIES)[number];

const OWNER = "Lon3035";
const REPO = "ACC_Setups";
const BRANCH = "master";
const REVALIDATE_SECONDS = 60 * 30;
const FETCH_TIMEOUT_MS = 8000;

const PARAM_RANGES: Record<string, ParamRange> = {
  // Tyres
  PSI: { min: 19, max: 35 },
  Toe: { min: -0.5, max: 0.5 },
  Camber: { min: -5, max: 0 },
  Caster: { min: 6, max: 16 },
  // Electronics
  TC: { min: 0, max: 12 },
  ABS: { min: 0, max: 12 },
  ECUMap: { min: 1, max: 12 },
  TC2: { min: 0, max: 12 },
  // Brakes / mechanical
  Front: { min: 0, max: 6 },
  Rear: { min: 0, max: 6 },
  "Antiroll Bar": { min: 0, max: 49 },
  "Brake Power": { min: 80, max: 100 },
  "Brake Bias": { min: 45, max: 70 },
  "Steer Ratio": { min: 8, max: 20 },
  "Wheel Rate": { min: 20000, max: 300000 },
  "Bumpstop Rate": { min: 0, max: 2400 },
  "Bumpstop Range": { min: 0, max: 60 },
  Preload: { min: 0, max: 400 },
  // Dampers
  Bump: { min: 0, max: 40 },
  "Fast Bump": { min: 0, max: 40 },
  Rebound: { min: 0, max: 40 },
  "Fast Rebound": { min: 0, max: 40 },
  // Aero
  "Ride Height": { min: 40, max: 130 },
  "Ride Height N24": { min: 40, max: 130 },
  Splitter: { min: 0, max: 20 },
  "Brake Ducts": { min: 0, max: 6 },
  "Rear Wing": { min: 0, max: 20 },
};

function splitSetupPath(path: string) {
  const [car = "", track = "", ...rest] = path.split("/");
  return {
    path,
    car,
    track,
    filename: rest.join("/"),
  };
}

function normalizeName(value: string): string {
  return value.replaceAll("_", " ").replaceAll("-", " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toDisplayName(value: string): string {
  const normalized = normalizeName(value);
  return normalized ? toTitleCase(normalized) : "";
}

function toFileDisplayName(filename: string): string {
  const noExtension = filename.replace(/\.json$/i, "");
  return toDisplayName(noExtension);
}

function toValidParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function buildHref(car: string, track: string, file: string, carClass: string, lang: string): string {
  const params = new URLSearchParams();
  if (car) {
    params.set("car", car);
  }
  if (track) {
    params.set("track", track);
  }
  if (file) {
    params.set("file", file);
  }
  if (carClass) {
    params.set("carClass", carClass);
  }
  if (lang) {
    params.set("lang", lang);
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function toFilterValues(entries: SetupEntry[], keyField: "carKey" | "trackKey", labelField: "carLabel" | "trackLabel") {
  const map = new Map<string, string>();

  for (const entry of entries) {
    const key = entry[keyField];
    const label = entry[labelField];

    if (!key || !label || map.has(key)) {
      continue;
    }

    map.set(key, label);
  }

  return [...map.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function toCarCategory(carKey: string): CarCategory {
  const value = normalizeName(carKey);
  if (value.includes("gt3")) return "gt3";
  if (value.includes("gt4")) return "gt4";
  if (value.includes("gt2")) return "gt2";
  if (value.includes("cup")) return "cup";
  if (value.includes("challenge")) return "challenge";
  if (value.includes(" st ") || value.endsWith(" st") || value.includes(" super trofeo")) return "st";
  return "other";
}

async function fetchSetupPaths(): Promise<string[]> {
  const treeUrl = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`;
  const response = await fetch(treeUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "accsetupsviewer",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const payload = (await response.json()) as { tree?: GitHubTreeItem[] };
  const tree = payload.tree ?? [];

  return tree
    .filter((entry) => entry.type === "blob" && entry.path.endsWith(".json"))
    .map((entry) => entry.path)
    .sort((a, b) => a.localeCompare(b));
}

async function fetchGoSetupsFinalValues(path: string): Promise<Record<string, unknown> | null> {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const filename = path.split("/").at(-1) ?? "setup.json";
  const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${encodedPath}`;
  const rawResponse = await fetch(rawUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { "User-Agent": "accsetupsviewer" },
  });

  if (!rawResponse.ok) {
    throw new Error(`Raw setup fetch failed: ${rawResponse.status}`);
  }

  const rawText = await rawResponse.text();
  const form = new FormData();
  form.append("fileToUpload", new File([rawText], filename, { type: "application/json" }));

  const goResponse = await fetch("https://gosetups.gg/acc-setup-viewer-comparator/", {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS * 2),
    headers: { "User-Agent": "accsetupsviewer" },
    cache: "no-store",
  });

  if (!goResponse.ok) {
    throw new Error(`GoSetups upload failed: ${goResponse.status}`);
  }

  const html = await goResponse.text();
  const match = html.match(/const jsonSetupFiles = (\{[\s\S]*?\});\s*const jsonSetupFilesOrder =/);
  if (!match?.[1]) {
    return null;
  }

  const jsonSetupFiles = JSON.parse(match[1]) as Record<string, unknown>;
  const fileNode = asRecord(jsonSetupFiles[filename]);
  const dataNode = asRecord(fileNode?.data);
  const uploadsNode = asRecord(dataNode?.uploads);
  const baseName = filename.replace(/\.json$/i, "");
  const setupKeys = uploadsNode ? Object.keys(uploadsNode) : [];
  const setupKey =
    setupKeys.find((key) => key === baseName) ??
    setupKeys.find((key) => key.toLowerCase() === baseName.toLowerCase()) ??
    setupKeys.find((key) => key.toLowerCase().includes(baseName.toLowerCase())) ??
    setupKeys[0] ??
    "";
  const setupNode = setupKey ? asRecord(uploadsNode?.[setupKey]) : null;
  const finalValues = asRecord(setupNode?.setupFinalValues);
  return finalValues ?? null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function formatValue(value: unknown): string {
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return `${value}`;
    }
    return value.toFixed(4).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "string") {
    return value;
  }

  return "-";
}

function parseNumericValue(value: string): number | null {
  const normalized = value.replace(",", ".");
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBarPercent(label: string, value: string): number | null {
  let range = PARAM_RANGES[label];
  if (!range) {
    // Fallback based on rendered unit where range is not explicitly mapped.
    if (value.includes("%")) {
      range = { min: 0, max: 100 };
    } else if (value.includes("N/m")) {
      range = { min: 20000, max: 300000 };
    } else if (value.includes(" N")) {
      range = { min: 0, max: 2400 };
    } else if (value.includes("°")) {
      range = { min: -5, max: 5 };
    }
  }

  if (!range || range.max <= range.min) {
    return null;
  }

  const numeric = parseNumericValue(value);
  if (numeric === null) {
    return null;
  }

  const percent = ((numeric - range.min) / (range.max - range.min)) * 100;
  return Math.max(0, Math.min(100, percent));
}

function InfoGrid({ items, noValuesText }: { items: KeyValueItem[]; noValuesText: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">{noValuesText}</p>;
  }

  return (
    <dl className="space-y-1">
      {items.map((item) => {
        const barPercent = toBarPercent(item.label, item.value);
        return (
          <div
            key={`${item.label}-${item.value}`}
            className="border-b border-zinc-200 py-1 text-sm last:border-b-0"
          >
            <div className="flex items-start justify-between gap-3">
              <dt className="text-zinc-500">{item.label}</dt>
              <dd className="text-right font-semibold text-zinc-900">{item.value}</dd>
            </div>
            {barPercent !== null ? (
              <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-200">
                <div
                  className="h-1.5 rounded-full bg-red-500"
                  style={{ width: `${barPercent}%` }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </dl>
  );
}

function SetupCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-zinc-900">{title}</h3>
      {children}
    </section>
  );
}


function SetupDetails({ data, selectedEntry, t }: { data: unknown; selectedEntry: SetupEntry | null; t: UiText }) {
  const finalValues = asRecord(data);
  if (!finalValues) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">{t.selectedSetupParams}</h2>
        <p className="mt-2 text-sm text-zinc-500">{t.selectValidFile}</p>
      </section>
    );
  }

  const tyres = asRecord(finalValues.TYRES);
  const mechanical = asRecord(finalValues.MECHANICAL);
  const electronics = asRecord(finalValues.ELECTRONICS);
  const brakes = asRecord(finalValues.BREAKS ?? finalValues.BRAKES);
  const dampers = asRecord(finalValues.DAMPERS);
  const aero = asRecord(finalValues.AERO);

  const tyreByCorner = (corner: "LF" | "RF" | "LR" | "RR") => asRecord(tyres?.[corner]);
  const mechByCorner = (corner: "LF" | "RF" | "LR" | "RR") => asRecord(mechanical?.[corner]);
  const dampByCorner = (corner: "LF" | "RF" | "LR" | "RR") => asRecord(dampers?.[corner]);

  return (
    <section id="setup-details" className="scroll-mt-44 rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-zinc-900">{t.selectedSetupParams}</h2>
      <p className="mt-1 text-sm text-zinc-600">
        {selectedEntry ? `${selectedEntry.carLabel} / ${selectedEntry.trackLabel} / ${selectedEntry.filenameLabel}` : t.selectFileHint}
      </p>
      {selectedEntry ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
            <p className="text-xs text-zinc-500">{t.carName}</p>
            <p className="text-sm font-semibold text-zinc-900">{selectedEntry.carLabel}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
            <p className="text-xs text-zinc-500">{t.circuit}</p>
            <p className="text-sm font-semibold text-zinc-900">{selectedEntry.trackLabel}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        <SetupCard title={t.tyres}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: "LF", label: t.leftFront },
              { key: "RF", label: t.rightFront },
              { key: "LR", label: t.leftRear },
              { key: "RR", label: t.rightRear },
            ].map((corner) => {
              const values = tyreByCorner(corner.key as "LF" | "RF" | "LR" | "RR");
              return (
                <div key={corner.key} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{corner.label}</p>
                  <InfoGrid
                    noValuesText={t.noValues}
                    items={[
                      { label: "PSI", value: formatValue(values?.PSI) },
                      { label: "Toe", value: formatValue(values?.Toe) },
                      { label: "Camber", value: formatValue(values?.Camber) },
                      { label: "Caster", value: formatValue(values?.Caster) },
                    ]}
                  />
                </div>
              );
            })}
          </div>
        </SetupCard>

        <SetupCard title={t.electronicsAndBrakes}>
          <div className="grid gap-3 md:grid-cols-2">
            <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t.electronics}</p>
              <InfoGrid
                noValuesText={t.noValues}
                items={[
                  { label: "TC", value: formatValue(electronics?.TC) },
                  { label: "ABS", value: formatValue(electronics?.ABS) },
                  { label: "ECUMap", value: formatValue(electronics?.ECUMap) },
                  { label: "TC2", value: formatValue(electronics?.TC2) },
                ]}
              />
            </section>
            <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t.brakes}</p>
              <InfoGrid
                noValuesText={t.noValues}
                items={[
                  { label: "Front", value: formatValue(brakes?.Front) },
                  { label: "Rear", value: formatValue(brakes?.Rear) },
                ]}
              />
            </section>
          </div>
        </SetupCard>

        <SetupCard title={t.mechanicalGrip}>
          <div className="space-y-3">
            <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t.front}</p>
              <InfoGrid
                noValuesText={t.noValues}
                items={[
                  { label: "Antiroll Bar", value: formatValue(asRecord(mechanical?.FRONT)?.AntirollBar) },
                  { label: "Brake Power", value: formatValue(asRecord(mechanical?.FRONT)?.BrakePower) },
                  { label: "Brake Bias", value: formatValue(asRecord(mechanical?.FRONT)?.BrakeBias) },
                  { label: "Steer Ratio", value: formatValue(asRecord(mechanical?.FRONT)?.SteerRatio) },
                ]}
              />
            </section>

            <section className="grid gap-3 md:grid-cols-2">
              {[
                { key: "LF", label: t.leftFront },
                { key: "RF", label: t.rightFront },
                { key: "LR", label: t.leftRear },
                { key: "RR", label: t.rightRear },
              ].map((corner) => {
                const values = mechByCorner(corner.key as "LF" | "RF" | "LR" | "RR");
                return (
                  <div key={corner.key} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{corner.label}</p>
                    <InfoGrid
                      noValuesText={t.noValues}
                      items={[
                        { label: "Wheel Rate", value: formatValue(values?.WheelRate) },
                        { label: "Bumpstop Rate", value: formatValue(values?.BumpstopRate) },
                        { label: "Bumpstop Range", value: formatValue(values?.BumpstopRange) },
                      ]}
                    />
                  </div>
                );
              })}
            </section>

            <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t.rear}</p>
              <InfoGrid
                noValuesText={t.noValues}
                items={[
                  { label: "Antiroll Bar", value: formatValue(asRecord(mechanical?.REAR)?.AntirollBar) },
                  { label: "Preload", value: formatValue(asRecord(mechanical?.REAR)?.Preload) },
                ]}
              />
            </section>
          </div>
        </SetupCard>

        <SetupCard title={t.dampers}>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { key: "LF", label: t.leftFront },
              { key: "RF", label: t.rightFront },
              { key: "LR", label: t.leftRear },
              { key: "RR", label: t.rightRear },
            ].map((corner) => {
              const values = dampByCorner(corner.key as "LF" | "RF" | "LR" | "RR");
              return (
                <div key={corner.key} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{corner.label}</p>
                  <InfoGrid
                    noValuesText={t.noValues}
                    items={[
                      { label: "Bump", value: formatValue(values?.Bump) },
                      { label: "Fast Bump", value: formatValue(values?.FastBump) },
                      { label: "Rebound", value: formatValue(values?.Rebound) },
                      { label: "Fast Rebound", value: formatValue(values?.FastRebound) },
                    ]}
                  />
                </div>
              );
            })}
          </div>
        </SetupCard>

        <SetupCard title={t.aero}>
          <div className="grid gap-3 md:grid-cols-2">
            <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t.front}</p>
              <InfoGrid
                noValuesText={t.noValues}
                items={[
                  { label: "Ride Height", value: formatValue(asRecord(aero?.FRONT)?.RideHeight) },
                  { label: "Ride Height N24", value: formatValue(asRecord(aero?.FRONT)?.RideHeightN24) },
                  { label: "Splitter", value: formatValue(asRecord(aero?.FRONT)?.Splitter) },
                  { label: "Brake Ducts", value: formatValue(asRecord(aero?.FRONT)?.BrakeDucts) },
                ]}
              />
            </section>
            <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t.rear}</p>
              <InfoGrid
                noValuesText={t.noValues}
                items={[
                  { label: "Ride Height", value: formatValue(asRecord(aero?.REAR)?.RideHeight) },
                  { label: "Ride Height N24", value: formatValue(asRecord(aero?.REAR)?.RideHeightN24) },
                  { label: "Rear Wing", value: formatValue(asRecord(aero?.REAR)?.RearWing) },
                  { label: "Brake Ducts", value: formatValue(asRecord(aero?.REAR)?.BrakeDucts) },
                ]}
              />
            </section>
          </div>
        </SetupCard>
      </div>
    </section>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const lang = normalizeLang(toValidParam(params.lang));
  const t = getUiText(lang);

  let paths: string[] = [];
  let loadError = "";

  try {
    paths = await fetchSetupPaths();
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "GitHub request timeout (8s)"
        : error instanceof Error
          ? error.message
          : "Unknown error";
    loadError = `${t.dataLoadErrorPrefix}: ${message}`;
  }

  const entries: SetupEntry[] = paths
    .map(splitSetupPath)
    .map((entry) => ({
      ...entry,
      filenameLabel: toFileDisplayName(entry.filename),
      carKey: normalizeName(entry.car),
      trackKey: normalizeName(entry.track),
      carLabel: toDisplayName(entry.car),
      trackLabel: toDisplayName(entry.track),
    }))
    .filter((entry) => entry.carKey && entry.trackKey && entry.filename);

  const requestedCar = normalizeName(toValidParam(params.car));
  const requestedTrack = normalizeName(toValidParam(params.track));
  const requestedCarClass = normalizeName(toValidParam(params.carClass));

  const carValues = toFilterValues(entries, "carKey", "carLabel");
  const trackValues = toFilterValues(entries, "trackKey", "trackLabel");

  const selectedCar = carValues.some((item) => item.key === requestedCar) ? requestedCar : "";
  const selectedTrack = trackValues.some((item) => item.key === requestedTrack) ? requestedTrack : "";
  const selectedCarClass = CAR_CATEGORIES.includes(requestedCarClass as CarCategory)
    ? (requestedCarClass as CarCategory)
    : "gt3";
  const classByCar = Object.fromEntries(carValues.map((item) => [item.key, toCarCategory(item.key)]));

  const filteredEntries = entries.filter((entry) => {
    if (selectedCar && entry.carKey !== selectedCar) {
      return false;
    }
    if (selectedTrack && entry.trackKey !== selectedTrack) {
      return false;
    }
    return true;
  });

  const requestedFile = toValidParam(params.file);
  const selectedFile = filteredEntries.some((entry) => entry.path === requestedFile)
    ? requestedFile
    : filteredEntries[0]?.path ?? "";
  const selectedEntry = filteredEntries.find((entry) => entry.path === selectedFile) ?? null;

  let selectedFinalValues: unknown = null;
  let selectedFinalValuesError = "";

  if (selectedFile) {
    try {
      selectedFinalValues = await fetchGoSetupsFinalValues(selectedFile);
    } catch (error) {
      const message =
        error instanceof Error && error.name === "TimeoutError"
          ? "GoSetups request timeout (16s)"
          : error instanceof Error
            ? error.message
            : "Unknown error";
      selectedFinalValuesError = `${t.valueLoadErrorPrefix}: ${message}`;
    }
  }

  const groupByCircuit = Boolean(selectedCar && !selectedTrack);
  const groupByCar = Boolean(!selectedCar && selectedTrack);
  const hasPrimarySelection = Boolean(selectedCar || selectedTrack);
  const selectedCarLabel = carValues.find((item) => item.key === selectedCar)?.label ?? "-";
  const selectedTrackLabel = trackValues.find((item) => item.key === selectedTrack)?.label ?? "-";

  const entriesGroupedByTrack = filteredEntries.reduce(
    (acc, entry) => {
      const bucket = acc.get(entry.trackKey);
      if (bucket) {
        bucket.entries.push(entry);
      } else {
        acc.set(entry.trackKey, { label: entry.trackLabel, entries: [entry] });
      }
      return acc;
    },
    new Map<string, { label: string; entries: SetupEntry[] }>(),
  );

  const entriesGroupedByCar = filteredEntries.reduce(
    (acc, entry) => {
      const bucket = acc.get(entry.carKey);
      if (bucket) {
        bucket.entries.push(entry);
      } else {
        acc.set(entry.carKey, { label: entry.carLabel, entries: [entry] });
      }
      return acc;
    },
    new Map<string, { label: string; entries: SetupEntry[] }>(),
  );

  return (
    <div className="min-h-screen bg-zinc-50 py-10">
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-8">
        <FiltersPanel
          carValues={carValues}
          trackValues={trackValues}
          selectedCar={selectedCar}
          selectedTrack={selectedTrack}
          selectedCarClass={selectedCarClass}
          classByCar={classByCar}
          lang={lang}
        />

        {hasPrimarySelection ? (
          <>
            <section className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-zinc-900">{t.allSetupsTitle}</h2>
              <p className="mt-1 text-sm text-zinc-600">
                {t.clickFileHint}
              </p>

              {filteredEntries.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">{t.noResults}</p>
              ) : groupByCircuit ? (
                <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200">
              <div className="space-y-2 p-2 md:hidden">
                {[...entriesGroupedByTrack.entries()]
                  .sort((a, b) => a[1].label.localeCompare(b[1].label))
                  .map(([trackKey, group]) => {
                    const hasActive = group.entries.some((entry) => entry.path === selectedFile);
                    return (
                      <details key={trackKey} open={hasActive} className="rounded-lg border border-zinc-200 bg-white">
                        <summary className="cursor-pointer list-none px-3 py-2">
                          <p className="text-sm font-semibold text-zinc-900">{group.label}</p>
                          <p className="text-xs text-zinc-500">{group.entries.length} {t.setupsWord}</p>
                        </summary>
                        <div className="space-y-2 border-t border-zinc-200 bg-zinc-50 p-2">
                          {group.entries.map((entry) => {
                            const active = entry.path === selectedFile;
                            return (
                              <SetupSelectLink
                                key={entry.path}
                                href={`${buildHref(selectedCar, selectedTrack, entry.path, selectedCarClass, lang)}#setup-details`}
                                  className={[
                                    "block rounded-lg border px-3 py-2 text-sm",
                                    active
                                      ? "border-[#23a936] bg-[#23a936] text-white"
                                      : "border-zinc-200 bg-white text-zinc-800",
                                  ].join(" ")}
                              >
                                <p className="font-medium">{entry.filenameLabel}</p>
                                <p className="text-xs opacity-80">{entry.carLabel}</p>
                              </SetupSelectLink>
                            );
                          })}
                        </div>
                      </details>
                    );
                  })}
              </div>
              <table className="hidden min-w-full divide-y divide-zinc-200 text-sm md:table">
                <thead className="bg-zinc-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">{t.tableCar}</th>
                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">{t.tableTrack}</th>
                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">{t.tableNotes}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {[...entriesGroupedByTrack.entries()]
                    .sort((a, b) => a[1].label.localeCompare(b[1].label))
                    .map(([trackKey, group]) => {
                      const hasActive = group.entries.some((entry) => entry.path === selectedFile);
                      return (
                        <tr key={trackKey}>
                          <td colSpan={3} className="p-0">
                            <details open={hasActive}>
                              <summary className="cursor-pointer list-none px-3 py-2 hover:bg-zinc-50">
                                <div className="grid grid-cols-3 gap-2">
                                  <span className="font-medium text-zinc-800">{selectedCarLabel}</span>
                                  <span className="text-zinc-800">{group.label}</span>
                                  <span className="text-zinc-600">{group.entries.length} {t.setupsWord}</span>
                                </div>
                              </summary>
                              <div className="border-t border-zinc-200 bg-zinc-50">
                                {group.entries.map((entry) => {
                                  const active = entry.path === selectedFile;
                                  return (
                                    <SetupSelectLink
                                      key={entry.path}
                                      href={`${buildHref(selectedCar, selectedTrack, entry.path, selectedCarClass, lang)}#setup-details`}
                                      className={[
                                        "grid grid-cols-3 gap-2 px-3 py-2 pl-8 text-sm",
                                        active ? "bg-[#23a936] text-white" : "text-zinc-800 hover:bg-zinc-100",
                                      ].join(" ")}
                                    >
                                      <span>{entry.carLabel}</span>
                                      <span>{entry.trackLabel}</span>
                                      <span>{entry.filenameLabel}</span>
                                    </SetupSelectLink>
                                  );
                                })}
                              </div>
                            </details>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
                </div>
              ) : groupByCar ? (
                <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200">
              <div className="space-y-2 p-2 md:hidden">
                {[...entriesGroupedByCar.entries()]
                  .sort((a, b) => a[1].label.localeCompare(b[1].label))
                  .map(([carKey, group]) => {
                    const hasActive = group.entries.some((entry) => entry.path === selectedFile);
                    return (
                      <details key={carKey} open={hasActive} className="rounded-lg border border-zinc-200 bg-white">
                        <summary className="cursor-pointer list-none px-3 py-2">
                          <p className="text-sm font-semibold text-zinc-900">{group.label}</p>
                          <p className="text-xs text-zinc-500">{group.entries.length} {t.setupsWord}</p>
                        </summary>
                        <div className="space-y-2 border-t border-zinc-200 bg-zinc-50 p-2">
                          {group.entries.map((entry) => {
                            const active = entry.path === selectedFile;
                            return (
                              <SetupSelectLink
                                key={entry.path}
                                href={`${buildHref(selectedCar, selectedTrack, entry.path, selectedCarClass, lang)}#setup-details`}
                                  className={[
                                    "block rounded-lg border px-3 py-2 text-sm",
                                    active
                                      ? "border-[#23a936] bg-[#23a936] text-white"
                                      : "border-zinc-200 bg-white text-zinc-800",
                                  ].join(" ")}
                              >
                                <p className="font-medium">{entry.filenameLabel}</p>
                                <p className="text-xs opacity-80">{entry.trackLabel}</p>
                              </SetupSelectLink>
                            );
                          })}
                        </div>
                      </details>
                    );
                  })}
              </div>
              <table className="hidden min-w-full divide-y divide-zinc-200 text-sm md:table">
                <thead className="bg-zinc-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">{t.tableCar}</th>
                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">{t.tableTrack}</th>
                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">{t.tableNotes}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {[...entriesGroupedByCar.entries()]
                    .sort((a, b) => a[1].label.localeCompare(b[1].label))
                    .map(([carKey, group]) => {
                      const hasActive = group.entries.some((entry) => entry.path === selectedFile);
                      return (
                        <tr key={carKey}>
                          <td colSpan={3} className="p-0">
                            <details open={hasActive}>
                              <summary className="cursor-pointer list-none px-3 py-2 hover:bg-zinc-50">
                                <div className="grid grid-cols-3 gap-2">
                                  <span className="font-medium text-zinc-800">{group.label}</span>
                                  <span className="text-zinc-800">{selectedTrackLabel}</span>
                                  <span className="text-zinc-600">{group.entries.length} {t.setupsWord}</span>
                                </div>
                              </summary>
                              <div className="border-t border-zinc-200 bg-zinc-50">
                                {group.entries.map((entry) => {
                                  const active = entry.path === selectedFile;
                                  return (
                                    <SetupSelectLink
                                      key={entry.path}
                                      href={`${buildHref(selectedCar, selectedTrack, entry.path, selectedCarClass, lang)}#setup-details`}
                                      className={[
                                        "grid grid-cols-3 gap-2 px-3 py-2 pl-8 text-sm",
                                        active ? "bg-[#23a936] text-white" : "text-zinc-800 hover:bg-zinc-100",
                                      ].join(" ")}
                                    >
                                      <span>{entry.carLabel}</span>
                                      <span>{entry.trackLabel}</span>
                                      <span>{entry.filenameLabel}</span>
                                    </SetupSelectLink>
                                  );
                                })}
                              </div>
                            </details>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200">
              <div className="space-y-2 p-2 md:hidden">
                {filteredEntries.map((entry) => {
                  const active = entry.path === selectedFile;
                  return (
                    <SetupSelectLink
                      key={entry.path}
                      href={`${buildHref(selectedCar, selectedTrack, entry.path, selectedCarClass, lang)}#setup-details`}
                      className={[
                        "block rounded-lg border px-3 py-2 text-sm",
                        active
                          ? "border-[#23a936] bg-[#23a936] text-white"
                          : "border-zinc-200 bg-white text-zinc-800",
                      ].join(" ")}
                    >
                      <p className="font-medium">{entry.filenameLabel}</p>
                      <p className="text-xs opacity-80">{entry.carLabel}</p>
                      <p className="text-xs opacity-80">{entry.trackLabel}</p>
                    </SetupSelectLink>
                  );
                })}
              </div>
              <table className="hidden min-w-full divide-y divide-zinc-200 text-sm md:table">
                <thead className="bg-zinc-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">{t.tableCar}</th>
                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">{t.tableTrack}</th>
                    <th className="px-3 py-2 text-left font-semibold text-zinc-700">{t.tableNotes}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {filteredEntries.map((entry) => {
                    const active = entry.path === selectedFile;
                    const rowClass = active
                      ? "bg-[#23a936] text-white"
                      : "text-zinc-800 hover:bg-zinc-50";
                    return (
                      <tr key={entry.path} className={rowClass}>
                        <td className="px-3 py-2">
                          <SetupSelectLink href={`${buildHref(selectedCar, selectedTrack, entry.path, selectedCarClass, lang)}#setup-details`} className="block w-full">
                            {entry.carLabel}
                          </SetupSelectLink>
                        </td>
                        <td className="px-3 py-2">
                          <SetupSelectLink href={`${buildHref(selectedCar, selectedTrack, entry.path, selectedCarClass, lang)}#setup-details`} className="block w-full">
                            {entry.trackLabel}
                          </SetupSelectLink>
                        </td>
                        <td className="px-3 py-2">
                          <SetupSelectLink href={`${buildHref(selectedCar, selectedTrack, entry.path, selectedCarClass, lang)}#setup-details`} className="block w-full">
                            {entry.filenameLabel}
                          </SetupSelectLink>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
                </div>
              )}
            </section>

            <section className="mt-6">
              <SetupDetails data={selectedFinalValues} selectedEntry={selectedEntry} t={t} />
            </section>
          </>
        ) : null}

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
          <h1 className="text-3xl font-bold text-zinc-900">CaliACCSetupsViewer</h1>
          <p className="mt-2 text-zinc-600">
            {t.sourceData}:{" "}
            <a
              href={`https://github.com/${OWNER}/${REPO}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#23a936] underline"
            >
              {OWNER}/{REPO}
            </a>{" "}
            ({BRANCH})
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {t.totalJsonFiles}: <span className="font-semibold text-zinc-700">{entries.length}</span>
          </p>
          <p className="text-sm text-zinc-500">
            {t.filteredResults}: <span className="font-semibold text-zinc-700">{filteredEntries.length}</span>
          </p>
          {loadError ? <p className="mt-3 text-sm text-red-600">{loadError}</p> : null}
          {selectedFinalValuesError ? <p className="mt-1 text-sm text-red-600">{selectedFinalValuesError}</p> : null}
        </section>
      </main>
    </div>
  );
}
