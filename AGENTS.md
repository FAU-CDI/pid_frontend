# AGENTS.md

## Project overview

PID Resolver (`pid_resolver`) is a public Next.js frontend for looking up and redirecting Persistent Identifiers via the QuickPID public APIs.
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
  At minimum it must understand absolute URLs that point at this frontend’s own pages (same-host links to namespace, mount, PID, and Open URL routes), including both **language-prefixed** and **non-language-prefixed** forms (e.g. `/en/demo/123` and `/demo/123`, and `/?q=` / `/{locale}/?q=` equivalents).
  Parsing lives in `lib/resolver.ts` (`parsePIDField` and related helpers): when browse routes, locales, or URL shapes change, update that parser (and its tests) in the same change.
  Supported locale prefixes (allowlist in `i18n/routing.ts` / `lib/locales.ts`) must yield dual readings (full path and path with locale stripped); unsupported prefixes must not be stripped.
- Internationalization uses **next-intl** only (no DIY i18n stack).
  Locales are always path-prefixed (`/{locale}/…`); default locale is `en`.
  `localeCookie` must stay `false` (never set a locale cookie; re-detect every time).
  `localeDetection` is enabled so **unprefixed** entry URLs may **307** to a prefixed URL using `Accept-Language` (fallback `en`); never set a cookie when doing so.
  Prefixed URLs (`/en/…`, `/de/…`) must not vary by `Accept-Language`.
  UI copy lives in `messages/{locale}.json`. Adding a locale means extending the shared allowlist, message file, and language-switcher flag map together.
  `proxy.ts` is allowed solely for next-intl locale routing (not for status-code hacks on browse pages).
- `<html lang>` is the active UI locale.
  Language tagging for API-sourced fields: ids / mount / URL / PID pattern → `lang="zxx"`; metadata / tags → `lang="und"`; PID charset enum → `lang="en"`; Created/Updated → localized time strings; missing URL → localized “None”.
- Never render untrusted request input (query params, path segments used as prose, headers, etc.) as error **title** or **message** in the UI.
  There must be no page that lets callers inject custom error titles or messages via the URL.
  User-visible error copy must come from server-defined message catalogs (or fixed page content), keyed at most by an opaque allowlisted code.
  Prefilling Resolve form fields with the failed path or query is fine; that input must not appear in error titles or messages.
- Uniform HTTP, no client sniffing: never vary status, headers, or body based on `Accept`, `User-Agent`, or other client fingerprints.
  The same URL must behave the same for browsers, curl, and every other client.
  Do not invent hacky content-negotiation substitutes.
  **Exception:** unprefixed paths may redirect to a locale prefix based on `Accept-Language` (no cookie); once prefixed, responses must not vary by that header.
- Open URL is `/go` (under `/{locale}/…`): redirect when a target URL exists; otherwise render the result UI with breadcrumbs ending in **URL** and fixed server copy.
- HTTP status (maintainable App Router): guarantee **307** via `redirect()`, **5xx** via throw/`error.tsx`, and **404** for unmatched routes via `not-found.tsx`.
  Missing namespace/PID (and similar) must keep contextual breadcrumbs and Resolve UI, so those pages stay **200** with an error card — do not call `notFound()` for them (it replaces the page tree).
  Do not add Proxy, Pages Router, or other hacks for 410 or custom statuses on browse pages (next-intl `proxy.ts` for locale routing is the allowed exception).
  Clients must not rely on frontend status codes; point them at the QuickPID API (`PUBLIC_API_URL` footer link is display-only; fetches use `BACKEND_URL`).
- Stable public URL shapes: the routes under **URL shapes** in `README.md` are a **public API**.
  Do not remove or change them.
  Do not add new public routes unless the user explicitly requests that breaking or additive change.
  Homepage lookup `/{locale}/?q=` (and unprefixed `/?q=` via locale redirect) is part of that surface.
- Do not add Next.js Route Handler “API” routes for app features (no `/api/…`, no parallel “internal API” trees).
  We do not want to increase the public API surface: every HTTP route is effectively part of what clients can call and what we must keep stable.
  Homepage lookup and similar flows use public page URLs (e.g. `/?q=`) or server rendering/redirects—not fetchable JSON endpoints for the UI.
- `PUBLIC_API_URL` is an optional footer link (same omission rules as `IMPRINT_URL`); never use it as the fetch base.

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
Keep action labels consistent: **Show Details**, **Open URL** (product name may still say PID Resolver).
The homepage primary control is **Show Details**, matching scoped mode; scoped mode also shows **Open URL**.
The same user-facing terminology must be used in the UI and in user-facing README sections.
When renaming a label or error phrase in one place, update the other.
Do not introduce synonyms for the same action (for example, do not mix “Redirect” and “Open URL”).
Mock-mode UI is exempt.
Developer/operator README sections (setup, env vars, mock mode, CI) may keep technical terms.

## Accessibility

Target pragmatic **WCAG 2.2 AA** for keyboard and names/roles/states on all user-facing UI.
Mock-mode banner needs keyboard and focus treatment only; product terminology rules still apply elsewhere.
Every page must offer a skip link to `#main-content`, landmarks `header` / `main` / `footer` (header not inside `main`), and exactly one `h1` (current breadcrumb pattern via `ResolverPage`).
All interactive controls must be reachable and operable by keyboard (Tab / Shift+Tab / Enter / Space), show a visible `:focus-visible` ring, and must not create keyboard traps.
Prefer native semantics (`button`, `a`, `form`, `label` / `aria-label`, `nav`, etc.); add ARIA only when native HTML is insufficient—never redundant roles on native elements.
Form fields need an accessible name; associate errors with `aria-invalid` + `aria-describedby` and announce them (`role="alert"` / live region).
Do not put untrusted request input into error titles or messages (see Architecture invariants).
Dynamic feedback (copy success, status cards) must be announced to assistive tech where appropriate (`aria-live` / `role="status"` / `role="alert"`).
Links that open a new tab must expose that fact to screen readers (e.g. `OpensInNewTabHint`).
When adding or changing UI, update focus styles and a11y attributes in the same change.
Do not invent new a11y test scripts or dependencies unless explicitly requested.

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
