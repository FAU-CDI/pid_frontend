import { headers } from "next/headers";
import PidForm from "../../components/pid-form";
import ErrorPage from "../../components/error-page";

const backendUrl = process.env.BACKEND_URL;

export default async function MountPidPage({
  params,
}: {
  params: Promise<{
    mount: string;
    pid: string;
  }>;
}) {
  const { mount, pid } = await params;

  if (!backendUrl) {
    return (
      <ErrorPage
        status={500}
        title="Server Configuration Error"
        message="The server is not configured correctly."
      />
    );
  }

  const headersList = await headers();

  const protocol =
    headersList.get("x-forwarded-proto") || "http";

  const host = headersList.get("host");

  if (!host) {
    return (
      <ErrorPage
        status={500}
        title="Server Error"
        message="Unable to determine the request host."
      />
    );
  }

  const baseUri = `${protocol}://${host}/${mount}/`;

  const targetUrl =
    `${backendUrl}/resolver/mounts/` +
    `${encodeURIComponent(baseUri)}/` +
    `${encodeURIComponent(pid)}`;

  console.log(
    "Server-side mount PID request:",
    targetUrl
  );

  let response: Response;

  try {
    response = await fetch(targetUrl, {
      cache: "no-store",
    });

    console.log(
      "Go mount PID response:",
      response.status,
      response.statusText
    );
  } catch (error) {
    console.error(
      "Server-side mount PID request failed:",
      error
    );

    return (
      <ErrorPage
        status={502}
        title="Backend Unavailable"
        message="The backend could not be reached."
      />
    );
  }

  if (response.status === 404) {
    return (
      <ErrorPage
        status={404}
        title="PID Not Found"
        message="The requested PID does not exist in this mount."
      />
    );
  }

  if (!response.ok) {
    return (
      <ErrorPage
        status={502}
        title="Backend Error"
        message="The backend returned an error."
      />
    );
  }

  const data = await response.json();

  return (
    <PidForm
      mode="mount"
      baseUri={baseUri}
      initialPid={pid}
      initialData={data}
    />
  );
}