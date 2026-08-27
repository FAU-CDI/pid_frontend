# PID Resolver Frontend

A public Next.js frontend for resolving and exploring Persistent Identifiers (PIDs).

This frontend is intended for the **non-authentication mode** of the PID resolver backend. It allows any user to retrieve information about publicly accessible PIDs and resolve them to their associated URLs without logging in.

For the frontend intended for **authentication mode**, see:

[Authentication Mode Frontend](http://localhost:5173/)

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

## License

Copyright (c) 2026 Bidisha Borgohain and contributors.

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
