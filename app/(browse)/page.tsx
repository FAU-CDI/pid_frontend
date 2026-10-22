import AboutInfoCard from "@/app/components/about-info-card";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import { resolveExamplePlaceholder } from "@/lib/resolve-example";

export default function HomePage() {
  const placeholder = resolveExamplePlaceholder();

  return (
    <ResolverPage
      breadcrumbs={[homeBreadcrumb()]}
      resolve={<ResolvePanel mode="global" placeholder={placeholder} />}
      info={<AboutInfoCard />}
    />
  );
}
