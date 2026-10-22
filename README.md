# PID Resolver

A public Next.js frontend for resolving and exploring [QuickPID](https://github.com/tkw1536/quickpid/tree/main/spec) Persistent Identifiers.
This backend uses only public (and read-only) APIs, meaning it can be run by anyone.

## Features

- Check whether a namespace or a mounted base URI exists
- Look up a PID within a namespace or via a mount
- View PID details (URL, metadata, timestamps, tags, deleted status)
- Open a PID details page directly from its URL
- Redirect to the URL associated with a PID
- Show clear errors when a namespace, mount, or PID is missing, or when a PID has no associated URL
- No authentication required

## URL shapes

**Namespace**

- Query page: `/resolve/{namespaceId}`
- PID details: `/resolve/{namespaceId}/{pid}`
- Redirect: `/resolve/{namespaceId}/{pid}/go`

**Mount**

- Query page: `/{baseURI}/`
- PID details: `/{baseURI}/{pid}`
- Redirect: `/{baseURI}/{pid}/go`

**Homepage**

The homepage (`/`) includes a quick resolution field.
Enter a path such as `baseUri/PID` (or a namespace-style path) to jump into resolution.

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
| `DOCUMENTATION_URL`   | Footer link to user documentation. Defaults to the QuickPID spec documentation when unset.                   |
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
