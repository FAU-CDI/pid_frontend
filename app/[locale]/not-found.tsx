import { getTranslations } from "next-intl/server";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import LanguageSwitcher from "@/app/components/language-switcher";
import ResolverPage from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import { Link } from "@/i18n/navigation";
import { homeBreadcrumb, notFoundBreadcrumb } from "@/lib/breadcrumbs";
import { pageNotFound } from "@/lib/user-facing";

export default async function NotFound() {
  const t = await getTranslations("errors");
  const tn = await getTranslations("nav");

  return (
    <div className="page-shell">
      <header className="app-topbar">
        <div className="app-topbar-inner">
          <Link href="/" className="app-topbar-title">
            {tn("productName")}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main id="main-content">
        <ResolverPage
          breadcrumbs={[await homeBreadcrumb(), await notFoundBreadcrumb()]}
          resolve={<GlobalResolveForm />}
          info={
            <StatusInfoCard
              status={pageNotFound.status}
              title={t("pageNotFound.title")}
              message={t("pageNotFound.message")}
            />
          }
        />
      </main>
    </div>
  );
}
