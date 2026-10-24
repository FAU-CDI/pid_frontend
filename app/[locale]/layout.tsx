import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import MockModeBanner from "@/app/components/mock-mode-banner";
import OpensInNewTabHint from "@/app/components/opens-in-new-tab-hint";
import { ResolveExampleProvider } from "@/app/components/resolve-example-provider";
import { routing } from "@/i18n/routing";
import { getBackendClient } from "@/lib/backend/client";
import { optionalFooterHref } from "@/lib/footer-links";
import { resolveExamplePlaceholder } from "@/lib/resolve-example";
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
  const resolveExample = resolveExamplePlaceholder();

  return (
    <html lang={locale}>
      <body className="flex h-screen flex-col">
        <NextIntlClientProvider>
          <ResolveExampleProvider placeholder={resolveExample}>
            <a href="#main-content" className="skip-link">
              {t("skipToContent")}
            </a>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {children}
            </div>

            <div className="shrink-0">
              {usingMockClient && <MockModeBanner />}
              <footer className="bg-blue-950 px-4 py-3 text-white">
                <nav aria-label={t("footer")}>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
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
          </ResolveExampleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// for process.env to be picked up correctly during SSR!
export const dynamic = "force-dynamic";
