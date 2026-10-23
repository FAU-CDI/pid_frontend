import { getTranslations } from "next-intl/server";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import ResolverPage from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import { errorBreadcrumb, homeBreadcrumb } from "@/lib/breadcrumbs";
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
  const t = await getTranslations("errors");

  return (
    <ResolverPage
      breadcrumbs={[await homeBreadcrumb(), await errorBreadcrumb()]}
      resolve={<GlobalResolveForm />}
      info={
        <StatusInfoCard
          status={copy.status}
          title={t(`${copy.key}.title`)}
          message={t(`${copy.key}.message`)}
        />
      }
    />
  );
}
