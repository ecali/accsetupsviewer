# CaliACCSetupsViewer

CaliACCSetupsViewer is a Next.js + TypeScript + Tailwind CSS web app to browse and compare Assetto Corsa Competizione setup files.

## What It Does

- Reads setup JSON files from [Lon3035/ACC_Setups](https://github.com/Lon3035/ACC_Setups)
- Filters by car class, car and track
- Groups results dynamically (by track or car depending on selected filters)
- Shows detailed setup values with proportional bars
- Supports light/dark theme toggle
- Supports multilingual UI:
  - English (default)
  - Italian
  - Spanish
  - German
  - French
- PWA install support for Android and iOS

## Protected Area (In Progress)

A new protected area is available under `/dashboard` with Supabase authentication.

Current implementation includes:

- Login (`/login`) and Register (`/register`)
- Route protection via middleware
- Protected dashboard (`/dashboard`)
- Manual setup insertion (JSON + metadata)
- Lap time insertion
- Latest records list for both tables

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Run SQL schema from:

- `supabase/schema.sql`

This creates:

- `setups_manual`
- `lap_times`

with Row Level Security (users can access only their own rows).

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Project Links

- App repository: [ecali/accsetupsviewer](https://github.com/ecali/accsetupsviewer)
- Data source: [Lon3035/ACC_Setups](https://github.com/Lon3035/ACC_Setups)
- Converter reference: [GoSetups ACC Setup Viewer/Comparator](https://gosetups.gg/acc-setup-viewer-comparator/)
