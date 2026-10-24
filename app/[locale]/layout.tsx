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

function FooterLink({
  children,
  href,
}: {
  href: string | undefined;
  children: React.ReactNode | React.ReactNode[];
}) {
  const theHref = optionalFooterHref(href);
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
  const aboutUrl = process.env.ABOUT_URL;
  const imprintUrl = process.env.IMPRINT_URL;
  const privacyPolicyUrl = process.env.PRIVACY_POLICY_URL;
  const accessibilityUrl = process.env.ACCESSIBILITY_URL;
  const showFooter = Boolean(
    optionalFooterHref(aboutUrl) ||
      optionalFooterHref(imprintUrl) ||
      optionalFooterHref(privacyPolicyUrl) ||
      optionalFooterHref(accessibilityUrl)
  );
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
              {showFooter ? (
                <footer className="bg-blue-950 px-4 py-3 text-white">
                  <nav
                    aria-label={t("footer")}
                    className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs"
                  >
                    <FooterLink href={aboutUrl}>{tf("about")}</FooterLink>
                    <FooterLink href={imprintUrl}>{tf("imprint")}</FooterLink>
                    <FooterLink href={privacyPolicyUrl}>
                      {tf("privacy")}
                    </FooterLink>
                    <FooterLink href={accessibilityUrl}>
                      {tf("accessibility")}
                    </FooterLink>
                  </nav>
                </footer>
              ) : null}
            </div>
          </ResolveExampleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// for process.env to be picked up correctly during SSR!
export const dynamic = "force-dynamic";
