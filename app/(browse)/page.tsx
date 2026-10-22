import AboutInfoCard from "@/app/components/about-info-card";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";

export default function HomePage() {
  return (
    <ResolverPage
      breadcrumbs={[homeBreadcrumb()]}
      resolve={<ResolvePanel mode="global" />}
      info={<AboutInfoCard />}
    />
  );
}
