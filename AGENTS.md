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

## Git workflow

- No special branch or commit format.
- Before merge, keep CI green using the project’s existing scripts and workflows — do not invent alternate check commands.

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
