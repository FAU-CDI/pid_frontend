import PidForm from "../../../components/pid-form";
import ErrorPage from "../../../components/error-page";

const backendUrl = process.env.BACKEND_URL;

export default async function NamespacePidPage({
  params,
}: {
  params: Promise<{
    namespaceId: string;
    pid: string;
  }>;
}) {
  const { namespaceId, pid } = await params;

  if (!backendUrl) {
    return (
      <ErrorPage
        status={500}
        title="Server Configuration Error"
        message="The server is not configured correctly."
      />
    );
  }

  const targetUrl =
    `${backendUrl}/resolver/namespaces/` +
    `${encodeURIComponent(namespaceId)}/resources/` +
    `${encodeURIComponent(pid)}`;

  console.log(
    "Server-side namespace PID request:",
    targetUrl
  );

  let response: Response;

  try {
    response = await fetch(targetUrl, {
      cache: "no-store",
    });

    console.log(
      "Go namespace PID response:",
      response.status,
      response.statusText
    );
  } catch (error) {
    console.error(
      "Server-side namespace PID request failed:",
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
        message="The requested PID does not exist in this namespace."
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
      mode="namespace"
      namespaceId={namespaceId}
      initialPid={pid}
      initialData={data}
    />
  );
}