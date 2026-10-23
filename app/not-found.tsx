import Link from "next/link";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import { pageNotFound } from "@/lib/user-facing";

export default function NotFound() {
  return (
    <div className="page-shell">
      <header className="app-topbar">
        <Link href="/" className="app-topbar-title">
          PID Resolver
        </Link>
      </header>
      <main id="main-content">
        <ResolverPage
          breadcrumbs={[homeBreadcrumb(), { label: "Not found" }]}
          resolve={<GlobalResolveForm />}
          info={
            <StatusInfoCard
              status={404}
              title={pageNotFound.title}
              message={pageNotFound.message}
            />
          }
        />
      </main>
    </div>
  );
}
