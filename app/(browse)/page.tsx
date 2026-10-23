import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AboutInfoCard from "@/app/components/about-info-card";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import { getBackendClient, isBackendError } from "@/lib/backend/client";
import { hrefForResolved } from "@/lib/resolve-href";
import { resolveFirst } from "@/lib/resolver";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const client = getBackendClient();

  let error: string | undefined;

  if (q) {
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const host = headersList.get("host");

    if (!host) {
      throw new Error("Unable to determine host");
    }

    const hostname = host.split(":")[0];
    const publicBase = `${protocol}://${host}`;
    const result = await resolveFirst(q, publicBase, client, hostname);

    if (result === null) {
      error = "No matching namespace or PID.";
    } else {
      redirect(hrefForResolved(result, publicBase));
    }
  }

  const countResult = await client.getResourceCount();
  const pidCount = isBackendError(countResult) ? undefined : countResult.total;

  return (
    <ResolverPage
      breadcrumbs={[homeBreadcrumb()]}
      resolve={
        <GlobalResolveForm defaultQuery={q} error={error} />
      }
      info={<AboutInfoCard pidCount={pidCount} />}
    />
  );
}
