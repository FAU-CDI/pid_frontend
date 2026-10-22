# PID Resolver Frontend

A public Next.js frontend for resolving and exploring Persistent Identifiers (PIDs).

This frontend is intended to run using the public APIs of  [PID resolver](https://github.com/tkw1536/quickpid/tree/main/spec) backend. It allows any user to retrieve information about publicly accessible PIDs and resolve them to their associated URLs without logging in.

## Features

The PID Resolver Frontend allows unauthenticated users to:

* Check whether a namespace exists.
* Check whether a mount/base URI exists.
* Search for a PID within a namespace.
* Search for a PID using a mounted base URI.
* View the complete details of a PID.
* Directly access a PID details page through its URL.
* Redirect to the URL associated with a PID.
* Display an error when a PID does not exist.
* Display an error when a mount or namespace does not exist.
* Display an error when a PID has no associated URL.

The frontend does **not require authentication**.

---

## How It Works

A user first provides either:

1. A **namespace ID**, or
2. A **mounted base URI**

through the URL.

The application verifies the namespace or mount with the Go backend. If it exists, the user is shown a PID query page.

From that page, the user can:

* Enter a PID and click **Show Details**.
* Enter a PID and click **Redirect**.

The PID details include:

* PID
* Associated URL
* Metadata
* Date created
* Date updated
* Tags
* Deleted status

If the PID has no associated URL (`url: null`), attempting to redirect displays a **404 URL Not Found** error.

---

## Namespace Resolution

Namespace-based resolution uses the following URL structure:

```text
/resolve/{namespaceId}
```

For example:

```text
http://pid.bayern:3000/resolve/03b56314-59c4-40e0-8531-17c95961d6ee
```

where `03b56314-59c4-40e0-8531-17c95961d6ee` is the namespace ID.

Opening this URL first verifies that the namespace exists. If valid, the application displays a PID query page.

A PID can also be accessed directly:

```text
/resolve/{namespaceId}/{pid}
```

To directly resolve and redirect to the URL associated with a PID:

```text
/resolve/{namespaceId}/{pid}/go
```

If the PID does not exist, a **404** error is displayed.

If the PID exists but its `url` field is `null`, a **URL Not Found** error is displayed.

---

## Mount Resolution

The frontend also supports resolving PIDs through mounted base URIs.

For example, if the following base URI is mounted in the backend:

```text
http://pid.bayern:3000/base/
```

then opening:

```text
http://pid.bayern:3000/base/
```

opens the PID query page for that mount.

A PID can be accessed directly using:

```text
/{baseURI}/{pid}
```

To directly resolve and redirect to the associated resource:

```text
/{baseURI}/{pid}/go
```

---

## Homepage

The homepage is available at:

```text
http://pid.bayern:3000/
```

The homepage contains a quick PID resolution field.

Users can enter a path consisting of:

```text
baseUri/PID
```

---

## Deployment

This project includes a [Dockerfile](./Dockerfile).
The corresponding docker image is automatically built after every commit and published as a [GitHub package](https://github.com/FAU-CDI/pid_frontend/pkgs/container/pid_frontend). 

It can be run with something like:

```bash
docker run -t -i -p 3000:3000 -e BACKEND_URL=http://pid.example.com/api/v2 ghcr.io/fau-cdi/pid_frontend:latest
```

The following environment variables can be configured:

- `BACKEND_URL`: A url to the backend, should include the "api/v2". Should not have a trailing slash.
- `PUBLIC_BASE_URI`: Optional public frontend origin used when building absolute mount base URIs for the backend (no trailing slash). When set, overrides the request host so local/dev can match mounts registered under a different origin.
- `USE_MOCK_CLIENT`: Use the in-memory mock backend instead of calling the Go API (see [`lib/backend`](./lib/backend)).
- `DOCUMENTATION_URL`: A link to user-facing documentation. Defaults to the spec documentation.
- `IMPRINT_URL`: A link to an imprint.
- `PRIVACY_POLICY_URL`: A link to the privacy policy.
- `ACCESSIBILITY_URL`: A link to an accessibility notice.

---

## Backend client

Server-side calls to the Go QuickPID API use a typed client under [`lib/backend`](./lib/backend). Types are generated from the backend OpenAPI spec; the spec itself is **not** stored in this repository.

To regenerate types after a backend API change:

```bash
npm run generate:api -- /path/to/openapi.yaml
```

See [`lib/backend/README.md`](./lib/backend/README.md) for details.

---

## Tests

```bash
npm test
npm run test:watch
```

Tests use the mock backend client (`USE_MOCK_CLIENT`); they do not call the live Go API.

## License

Copyright (c) 2026 Bidisha Borgohain and contributors.

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
