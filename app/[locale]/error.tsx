"use client";

import { useTranslations } from "next-intl";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import LanguageSwitcher from "@/app/components/language-switcher";
import ResolverPage from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import { Link } from "@/i18n/navigation";
import { serviceNotAvailable } from "@/lib/user-facing";

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("errors");
  const tn = useTranslations("nav");

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
          breadcrumbs={[
            { href: "/", label: tn("home") },
            { label: tn("errorCrumb") },
          ]}
          resolve={<GlobalResolveForm />}
          info={
            <div className="space-y-4">
              <StatusInfoCard
                status={serviceNotAvailable.status}
                title={t("serviceNotAvailable.title")}
                message={t("serviceNotAvailable.message")}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={() => retry()}
              >
                {t("tryAgain")}
              </button>
            </div>
          }
        />
      </main>
    </div>
  );
}
