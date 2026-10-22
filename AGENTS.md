# AGENTS.md

## Project overview

PID Resolver (`pid-resolver`) is a public Next.js frontend for looking up and redirecting Persistent Identifiers via the QuickPID public APIs.
There is no authentication in this app.

## Setup

`package.json` is the authority for available scripts; the README describes what each is for.
Do not invent new scripts or assume dependency versions from memory — read `package.json`, the lockfile, and `.github/workflows/` for what this repo actually uses.

This is not the Next.js you may know from training data.
APIs, conventions, and file layout can differ.
Read the relevant guide under `node_modules/next/dist/docs/` before writing Next-specific code, and heed deprecation notices.

## Testing

- Co-locate `*.test.ts` / `*.test.tsx` next to the modules they cover.
- Jest setup forces mock mode; tests must not call the live Go API.

## Architecture invariants

- Every backend call uses **public read-only** APIs only.
  Do not introduce authenticated or mutating backend endpoints.
- Prefer the shared client under `lib/backend` over ad-hoc `fetch` against the Go API.
- Generated OpenAPI types are committed; the OpenAPI source document is not stored in this repository.
  Regenerate types explicitly when the backend API changes (see `lib/backend/README.md`).
- `USE_MOCK_CLIENT` selects the in-process mock implementation versus the real fetch client.
- `PUBLIC_BASE_URI` exists so absolute mount URIs can match backend registration when the request host differs from the public origin.
- The homepage Resolve field must accept whatever a user might paste, not only short relative paths.
  At minimum it must understand absolute URLs that point at this frontend’s own pages (same-host links to namespace, mount, PID, and Open URL routes).
  Parsing lives in `lib/resolver.ts` (`parsePIDField` and related helpers): when browse routes or URL shapes change, update that parser (and its tests) in the same change.

## Git workflow

- No special branch or commit format.
- Before merge, keep CI green using the project’s existing scripts and workflows — do not invent alternate check commands.

## User-facing copy

Write UI copy for non-technical users.
Allowed product terms: **PID**, **Namespace**, **URL**, **Resolve**.
Do not surface implementation terms in the UI (`mount`, `base URI` / `base_URI`, `backend`, `Go`, path registration, host headers, and similar).
Exception: the namespace card may show a **Mount:** label when a mount URL is present.
Prefer content errors (“No such namespace”, “This PID was not found”) over implementation talk (“not registered”, “unable to verify the base URI”).
Prefer service-focused outages (“Service unavailable”) over “backend” / “Go” language.
Keep action labels consistent: **Resolve**, **Show Details**, **Open URL**.
The same user-facing terminology must be used in the UI and in user-facing README sections.
When renaming a label or error phrase in one place, update the other.
Do not introduce synonyms for the same action (for example, do not mix “Redirect” and “Open URL”).
Mock-mode UI is exempt.
Developer/operator README sections (setup, env vars, mock mode, CI) may keep technical terms.

## README prose

The README is for humans and must stay readable.
In `README.md`, prefer one sentence per line.
Do not hard-wrap long sentences across multiple lines.
Keep Markdown tables column-aligned in the source.
Do not catalog mock fixtures in the README; the UI banner and code are the source of truth.

## Warnings

- ABSOLUTELY NO LINT IGNORES (`eslint-disable`, `@ts-ignore`, `@ts-expect-error`, or equivalents).
  Fix the code or adjust shared config when the user asks — never suppress.
- Do not turn rules off or weaken shared lint config unless the user explicitly asks to change that rule.
- NO WRITE INTERACTIONS UNLESS EXPLICITLY REQUESTED.
  Do not edit, create, delete, move, or overwrite files unless the user clearly asked for that change.
  Read-only investigation is fine; applying fixes is not, until asked.
- NEVER run `git checkout`, `git restore`, `git reset`, or any other command that discards or overwrites working-tree changes unless the user explicitly requests that exact recovery or discard.
- Never invent `package.json` scripts; only use scripts that exist.
- Always keep existing CI checks passing.
