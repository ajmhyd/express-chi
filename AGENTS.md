# Agent Guidelines for Express Chi

Chicago Kennedy express lane status. Fresh 2 app: Deno + Preact + Tailwind CSS
v4, built with Vite.

## Build/Lint/Test Commands

- **Dev**: `deno task dev` (Vite dev server)
- **Build**: `deno task build` (Vite build, output in `_fresh/`)
- **Preview**: `deno task preview` (serves the built app; run build first)
- **Lint**: `deno lint` (Fresh recommended rules from deno.json)
- **Format**: `deno fmt`

There is no test suite. Do not add one unless asked.

## Traffic data

Do not regress this. Reversible-lane detectors often report `Unknown` while the
lanes are open. A missing live travel time is not "no data."

`data/index.ts` fetches both sources in parallel, merges them, and caches the
result for 5 minutes. External requests time out after 3 seconds and return
`null` (see `request`).

### Direction (SigAlert)

`data/sigalert.ts` is the direction source of truth. It reads incidents whose
title is `Closed`:

- `Kennedy (I-90/94) Express Lanes West` closed → `Inbound` (eastbound, toward
  downtown). The westbound configuration is the one that is closed.
- `Kennedy (I-90/94) Express Lanes East` closed → `Outbound` (westbound, toward
  O'Hare).
- Both closed messages → `Closed`.
- Neither → `Unknown`.

Do not invert this mapping. SigAlert does not provide travel time or speed.

### Metrics (Travel Midwest)

`data/travelmidwest.ts` has the numbers. Inbound is EB, outbound is WB.

- Travel time and historical average come only from the full express lanes
  (Montrose ↔ Ohio): `IL-TESTTSC-249` inbound, `IL-TESTTSC-250` outbound, or a
  row whose ends are Montrose and Ohio.
- Shorter DMS segments may fill speed or congestion. They must not set travel
  time.
- Ignore rows past the reversibles (O'Hare, Tower Rd, US-12) and rows longer
  than 8 miles. That length is mostly I-90/I-94 local lanes.
- `getData()` passes SigAlert's direction into `parseTravelMidwest`. Keep the
  historical average and local speed for that direction even when live sensors
  are silent.
- Without a known direction: both directions reporting a non-Unknown level means
  the feed is unreliable (`Unknown`). Neither open means `Closed`.
- Speed: prefer a reported `spd` over one derived from length and travel time,
  then the longer segment.
- Congestion: highest rank among express-lane rows (Heavy > Medium > Light >
  Uncongested). Ignore `Unknown` when a real level exists.
- Local speed is the local-lane DMS row, not a reversible row.

### Merge

- Both sources agree on a non-Unknown direction → use Travel Midwest.
- Only SigAlert has a direction, and Travel Midwest has metrics → keep
  SigAlert's direction and Travel Midwest's fields.
- Only SigAlert has a direction → SigAlert.
- Otherwise Travel Midwest, or `{ direction: Unknown }`.

### UI

`islands/DataDisplay.tsx` polls `/api/data` every 5 minutes, pauses while the
tab is hidden, and retries once after 2 seconds. Keep showing the last good
payload on failure.

- Live travel time missing, average present: `typically N min`, not only "Data
  unavailable".
- Express speed missing, local speed present: `local N MPH`.
- Yellow note when travel time or speed is missing. Mention the typical time
  when an average exists.

`routes/api/data.ts` sends
`Cache-Control: public, max-age=60, stale-while-revalidate=240`.

## Code Style Guidelines

### Imports

- Import from relative paths with `.ts`/`.tsx` extensions (e.g.,
  `from "../types.ts"`)
- Group imports: external packages first, then local modules
- Use destructured imports for types/enums

### TypeScript

- Use explicit types for function parameters and return values
- Prefer `const enum` for enums (see types.ts)
- Use interfaces for object shapes, especially API responses
- Nullable types: use `| null` explicitly, with `?:` for optional properties

### Naming & Formatting

- Components: PascalCase (e.g., `TravelTimeDifference`)
- Files: PascalCase for components, camelCase for utilities
- Constants: UPPER_SNAKE_CASE (e.g., `TIMEOUT_MS`, `MSG_BASE`)
- Use 2-space indentation, semicolons required

### Error Handling

- Use try-catch with console.error for logging
- Return `null` on errors rather than throwing (see data/index.ts request
  function)
- Implement timeouts for external requests (3s default)
- Display graceful fallbacks in UI for missing data (e.g., "Data unavailable")

### Framework-Specific

- Built with Deno + Fresh + Preact + Tailwind CSS v4
- Use `class` (not `className`) in Fresh routes, `className` in
  islands/components
- Async components allowed in routes (Fresh 2.x feature)
- Use nullish coalescing (`??`) for default values
