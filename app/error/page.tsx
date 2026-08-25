import ErrorPage from "../components/error-page";

export default async function ErrorRoute({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    title?: string;
    message?: string;
  }>;
}) {
  const params = await searchParams;

  const status = Number(params.status) || 500;

  return (
    <ErrorPage
      status={status}
      title={params.title || "Something went wrong"}
      message={
        params.message ||
        "An unexpected error occurred."
      }
    />
  );
}