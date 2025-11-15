# Agent Guidelines for Express Chi

## Build/Lint/Test Commands

- **Dev**: `deno task dev` (runs Vite dev server)
- **Build**: `deno task build` (builds with Vite)
- **Preview**: `deno task preview` (serves built app)
- **Lint**: `deno lint` (uses Fresh recommended rules from deno.json)
- **Format**: `deno fmt`

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
