import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import LanguageSwitcher from "@/app/components/language-switcher";
import ResolverPage from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { pageNotFound } from "@/lib/user-facing";
import "./globals.css";

/**
 * Root not-found (outside `[locale]`). Uses default locale for chrome copy.
 */
export default async function RootNotFound() {
  const locale = routing.defaultLocale;
  const messages = (await import(`../messages/${locale}.json`)).default;
  const t = await getTranslations({ locale, namespace: "errors" });
  const tn = await getTranslations({ locale, namespace: "nav" });

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="page-shell flex flex-1 flex-col">
            <header className="app-topbar">
              <div className="app-topbar-inner">
                <Link href="/" className="app-topbar-title" locale={locale}>
                  {tn("productName")}
                </Link>
                <LanguageSwitcher />
              </div>
            </header>
            <main id="main-content">
              <ResolverPage
                breadcrumbs={[
                  { href: "/", label: tn("home") },
                  { label: tn("notFoundCrumb") },
                ]}
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
