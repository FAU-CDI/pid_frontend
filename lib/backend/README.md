# Backend client

Server-side access to the QuickPID Go API goes through this module so call sites share one base URL, consistent error shaping, and types that stay aligned with the backend OpenAPI document.

Prefer this client over ad-hoc `fetch` against the Go API. That keeps path and status handling in one place and avoids drifting from the contract when the backend changes. Absolute mount URIs for the Go API are built here as well (including an optional public-origin override), so call sites do not invent their own host joins.

The abstract client has two implementations: one that calls the real API, and a mock that never leaves the process. The mock exists so local UI work and future tests can cover every resolver path without a running backend. `USE_MOCK_CLIENT` selects which implementation `getBackendClient()` returns; `isMockClient()` lets the UI disclose mock mode.

Generated types live in this directory and are committed. The OpenAPI source itself must not: this frontend stays decoupled from the backend repo layout, and regenerating is an explicit step when the API changes—not something that runs on every `build` or `dev`.

## Regenerating types

Obtain a local copy of the QuickPID OpenAPI document (for example from the [backend spec](https://github.com/tkw1536/quickpid/tree/main/spec)), then run:

```bash
npm run generate:api -- /absolute/or/relative/path/to/openapi.yaml
```

The path argument is required. Omitting it prints usage and exits with an error.

Commit the updated generated file when the backend API changes.
