import { NextResponse } from "next/server";

type GitHubTreeItem = {
  path: string;
  type: "blob" | "tree";
};

const OWNER = "Lon3035";
const REPO = "ACC_Setups";
const BRANCH = "master";
const FETCH_TIMEOUT_MS = 8000;

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

export async function GET() {
  try {
    const treeUrl = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`;
    const response = await fetch(treeUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: 60 * 30 },
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "accsetupsviewer",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${response.status}` },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as { tree?: GitHubTreeItem[] };
    const tree = payload.tree ?? [];
    const jsonPaths = tree
      .filter((entry) => entry.type === "blob" && entry.path.endsWith(".json"))
      .map((entry) => entry.path);

    const carMap = new Map<string, string>();
    const trackMap = new Map<string, string>();

    for (const path of jsonPaths) {
      const [car = "", track = ""] = path.split("/");
      const carKey = normalizeName(car);
      const trackKey = normalizeName(track);

      if (carKey && !carMap.has(carKey)) {
        carMap.set(carKey, toDisplayName(car));
      }
      if (trackKey && !trackMap.has(trackKey)) {
        trackMap.set(trackKey, toDisplayName(track));
      }
    }

    const cars = [...carMap.entries()]
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
    const tracks = [...trackMap.entries()]
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return NextResponse.json({ cars, tracks });
  } catch {
    return NextResponse.json(
      { error: "Unable to load setup catalog." },
      { status: 500 },
    );
  }
}
