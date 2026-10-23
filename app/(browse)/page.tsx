import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AboutInfoCard from "@/app/components/about-info-card";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import { getBackendClient } from "@/lib/backend/client";
import { hrefForResolved } from "@/lib/resolve-href";
import { resolveExamplePlaceholder } from "@/lib/resolve-example";
import { resolveFirst } from "@/lib/resolver";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const placeholder = resolveExamplePlaceholder();

  let error: string | undefined;

  if (q) {
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const host = headersList.get("host");

    if (!host) {
      error = "Unable to resolve.";
    } else {
      const hostname = host.split(":")[0];
      const publicBase = `${protocol}://${host}`;
      const result = await resolveFirst(
        q,
        publicBase,
        getBackendClient(),
        hostname
      );

      if (result === null) {
        error = "No matching namespace or PID.";
      } else {
        redirect(hrefForResolved(result, publicBase));
      }
    }
  }

  return (
    <ResolverPage
      breadcrumbs={[homeBreadcrumb()]}
      resolve={
        <GlobalResolveForm
          defaultQuery={q}
          placeholder={placeholder}
          error={error}
        />
      }
      info={<AboutInfoCard />}
    />
  );
}
