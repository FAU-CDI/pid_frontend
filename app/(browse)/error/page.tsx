import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";

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
    <ResolverPage
      breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
      resolve={<ResolvePanel mode="global" />}
      info={
        <StatusInfoCard
          status={status}
          title={params.title || "Something went wrong"}
          message={
            params.message || "An unexpected error occurred."
          }
        />
      }
    />
  );
}
