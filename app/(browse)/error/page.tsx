import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import { errorPageForCode } from "@/lib/error-page";

export default async function ErrorRoute({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string;
  }>;
}) {
  const params = await searchParams;
  const copy = errorPageForCode(params.code);

  return (
    <ResolverPage
      breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
      resolve={<ResolvePanel mode="global" />}
      info={
        <StatusInfoCard
          status={copy.status}
          title={copy.title}
          message={copy.message}
        />
      }
    />
  );
}
