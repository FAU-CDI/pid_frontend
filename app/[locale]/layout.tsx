import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import MockModeBanner from "@/app/components/mock-mode-banner";
import OpensInNewTabHint from "@/app/components/opens-in-new-tab-hint";
import { routing } from "@/i18n/routing";
import { getBackendClient } from "@/lib/backend/client";
import { optionalFooterHref } from "@/lib/footer-links";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

function LegalLink({
  children,
  href,
  fallback,
}: {
  href: string | undefined;
  children: React.ReactNode | React.ReactNode[];
  fallback?: string;
}) {
  const theHref = optionalFooterHref(href) ?? optionalFooterHref(fallback);
  if (!theHref) {
    return null;
  }

  return (
    <a
      href={theHref}
      target="_blank"
      rel="noopener noreferrer"
      className="footer-link"
    >
      {children}
      <OpensInNewTabHint />
    </a>
  );
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations("nav");
  const tf = await getTranslations("footer");
  const documentationUrl = process.env.DOCUMENTATION_URL;
  const publicApiUrl = process.env.PUBLIC_API_URL;
  const imprintUrl = process.env.IMPRINT_URL;
  const privacyPolicyUrl = process.env.PRIVACY_POLICY_URL;
  const accessibilityUrl = process.env.ACCESSIBILITY_URL;
  const usingMockClient = getBackendClient().isMockClient();

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <a href="#main-content" className="skip-link">
            {t("skipToContent")}
          </a>
          <div
            className={`flex flex-1 flex-col ${usingMockClient ? "pb-28" : "pb-16"}`}
          >
            {children}
          </div>

          <div className="fixed bottom-0 z-50 w-full">
            {usingMockClient && <MockModeBanner />}
            <footer className="bg-blue-950 px-8 py-4 text-white">
              <nav aria-label={t("footer")}>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <LegalLink
                    href={documentationUrl}
                    fallback="https://github.com/tkw1536/quickpid/tree/main/spec"
                  >
                    {tf("documentation")}
                  </LegalLink>

                  <LegalLink href={publicApiUrl}>{tf("api")}</LegalLink>

                  <LegalLink href={imprintUrl}>{tf("imprint")}</LegalLink>

                  <LegalLink href={privacyPolicyUrl}>
                    {tf("privacy")}
                  </LegalLink>

                  <LegalLink href={accessibilityUrl}>
                    {tf("accessibility")}
                  </LegalLink>
                </div>
              </nav>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// for process.env to be picked up correctly during SSR!
export const dynamic = "force-dynamic";
