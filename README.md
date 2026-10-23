# PID Resolver

A public Next.js frontend for resolving and exploring [QuickPID](https://github.com/tkw1536/quickpid/tree/main/spec) Persistent Identifiers.
This backend uses only public (and read-only) APIs, meaning it can be run by anyone.

## Features

- Check whether a namespace exists
- Look up a PID within a namespace
- Show Details for a PID (URL, metadata, timestamps, tags, deleted status)
- Open a PID details page directly from its URL
- Open URL associated with a PID
- Show clear errors when a namespace or PID is missing, or when a PID has no associated URL
- No authentication required

## URL shapes

| Pattern                 | Path                                   | Notes                                                                 |
|-------------------------|----------------------------------------|-----------------------------------------------------------------------|
| Homepage                | `/`                                    | Show Details field; **200**                                           |
| Homepage lookup         | `/?q={query}`                          | **307** on match; form + message on miss (**200**)                    |
| Namespace query         | `/resolve/{namespaceId}`               | **200**; missing namespace keeps contextual UI                        |
| Namespace PID details   | `/resolve/{namespaceId}/{pid}`         | **200**; missing/deleted PID keeps details UI                         |
| Namespace Open URL      | `/resolve/{namespaceId}/{pid}/go`      | **307** to target, or result UI (**200**)                             |
| Mount query             | `/{baseURI}/`                          | **200**; missing mount keeps contextual UI                            |
| Mount PID details       | `/{baseURI}/{pid}`                     | **200**; missing/deleted PID keeps details UI                         |
| Mount Open URL          | `/{baseURI}/{pid}/go`                  | **307** to target, or result UI (**200**)                             |

Guaranteed HTTP statuses from this frontend: **307** on successful redirects, **5xx** when the page throws (service failure), and **404** for unmatched routes.
Missing namespace/PID pages keep breadcrumbs and Resolve controls, so those responses are **200** with an error card (App Router cannot set 404 while keeping that UI).

Do not rely on specific HTTP status codes from this frontend for programmatic clients.
Treat the HTML as a UI.
For resolution and status semantics, use the QuickPID API (`PUBLIC_API_URL` in the footer when configured, or your API base).

## Mock mode

Mock mode runs the UI against an in-process backend so you can develop and test without a live Go API.
Set `USE_MOCK_CLIENT` to a truthy value (`true`, `1`, or `yes`), then start the app as usual.
A banner appears while mock mode is on and lists the available fixtures.
Automated tests always use mock mode.

## Develop locally

```bash
npm install
npm run dev
```

Without mock mode, set `BACKEND_URL` to your QuickPID API base (including `api/v2`, no trailing slash).

| Script          | Purpose                                              |
|-----------------|------------------------------------------------------|
| `dev`           | Start the Next.js development server                 |
| `build`         | Create a production build                            |
| `start`         | Serve the production build                           |
| `lint`          | Run ESLint                                           |
| `test`          | Run Jest once                                        |
| `test:watch`    | Run Jest in watch mode                               |
| `generate:api`  | Regenerate OpenAPI TypeScript types (see below)      |

To regenerate API types after a backend OpenAPI change, see [`lib/backend/README.md`](./lib/backend/README.md).
Agent notes live in [AGENTS.md](./AGENTS.md).

## Configuration

| Variable              | Purpose                                                                                                      |
|-----------------------|--------------------------------------------------------------------------------------------------------------|
| `BACKEND_URL`         | Base URL of the QuickPID API (`…/api/v2`, no trailing slash). Required unless mock mode is enabled.          |
| `PUBLIC_BASE_URI`     | Optional public frontend origin (no trailing slash) used when building absolute mount URIs for the backend.  |
| `USE_MOCK_CLIENT`     | When truthy (`true` / `1` / `yes`), use the in-memory mock backend instead of the live API.                  |
| `RESOLVE_EXAMPLE`     | Placeholder shown in the homepage Resolve field. Defaults to a valid mock PID path (`demo/123`).             |
| `DOCUMENTATION_URL`   | Footer link to user documentation. Defaults to the QuickPID spec documentation when unset.                   |
| `PUBLIC_API_URL`      | Footer link to the public QuickPID API (display-only). Omitted from the footer when unset.                   |
| `IMPRINT_URL`         | Footer link to an imprint. Omitted from the footer when unset.                                               |
| `PRIVACY_POLICY_URL`  | Footer link to a privacy policy. Omitted from the footer when unset.                                         |
| `ACCESSIBILITY_URL`   | Footer link to an accessibility notice. Omitted from the footer when unset.                                  |

`PUBLIC_BASE_URI` exists so local or alternate hosts can still match mounts registered under a different public origin.

## CI and deployment

GitHub Actions runs lint and tests on pushes and pull requests.
On pushes to `main`, CI builds a multi-arch image from the [Dockerfile](./Dockerfile) and publishes it to GHCR as [`ghcr.io/fau-cdi/pid_frontend`](https://github.com/FAU-CDI/pid_frontend/pkgs/container/pid_frontend) (including the `latest` tag).

```bash
docker run --rm -p 3000:3000 \
  -e BACKEND_URL=https://pid.example.com/api/v2 \
  ghcr.io/fau-cdi/pid_frontend:latest
```

Other environment variables are listed under Configuration.

## License

Copyright (c) 2026 Bidisha Borgohain and contributors.

This project is licensed under the MIT License.
See the [LICENSE](LICENSE) file for details.
