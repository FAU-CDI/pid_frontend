import type { Metadata } from "next";
import MockModeBanner from "@/app/components/mock-mode-banner";
import OpensInNewTabHint from "@/app/components/opens-in-new-tab-hint";
import { getBackendClient } from "@/lib/backend/client";
import { optionalFooterHref } from "@/lib/footer-links";
import "./globals.css";

export const metadata: Metadata = {
  title: "PID Resolver",
  description: "Resolve and explore persistent identifiers.",
};

function LegalLink({ children, href, fallback }: {href: string|undefined, children: React.ReactNode|React.ReactNode[], fallback?: string}) {
  const theHref = optionalFooterHref(href) ?? optionalFooterHref(fallback);
  if (!theHref) {
    return null;
  }

  return (<a
              href={theHref}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >{children}<OpensInNewTabHint /></a>);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const documentationUrl = process.env.DOCUMENTATION_URL;
  const publicApiUrl = process.env.PUBLIC_API_URL;
  const imprintUrl = process.env.IMPRINT_URL;
  const privacyPolicyUrl = process.env.PRIVACY_POLICY_URL;
  const accessibilityUrl = process.env.ACCESSIBILITY_URL;
  const usingMockClient = getBackendClient().isMockClient();
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className={`flex flex-1 flex-col ${usingMockClient ? "pb-28" : "pb-16"}`}>
          {children}
        </div>

        <div className="fixed bottom-0 z-50 w-full">
          {usingMockClient && <MockModeBanner />}
          <footer className="bg-blue-950 px-8 py-4 text-white">
            <nav aria-label="Footer">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <LegalLink href={documentationUrl} fallback="https://github.com/tkw1536/quickpid/tree/main/spec"
                >
                  Documentation
                </LegalLink>

                <LegalLink href={publicApiUrl}>
                  API
                </LegalLink>

                <LegalLink
                  href={imprintUrl}
                >
                  Imprint
                </LegalLink>

                <LegalLink
                  href={privacyPolicyUrl}
                >
                  Privacy Policy
                </LegalLink>

                <LegalLink
                  href={accessibilityUrl}
                >
                  Accessibility
                </LegalLink>
              </div>
            </nav>
          </footer>
        </div>
      </body>
    </html>
  );
}

// for process.env to be picked up correctly during SSR!
export const dynamic = 'force-dynamic';
