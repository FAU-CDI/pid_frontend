import GlobalResolveForm from "@/app/components/global-resolve-form";
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
      resolve={<GlobalResolveForm />}
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
