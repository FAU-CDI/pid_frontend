import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PID Resolver",
  description: "Resolve and explore persistent identifiers.",
};

function LegalLink({ children, href, fallback }: {href: string|undefined, children: React.ReactNode|React.ReactNode[], fallback?: string}) {
  const theHref = typeof href === 'string' && href !== '' ? href : fallback;
  if (typeof theHref !== 'string' || theHref === '') {
    return null;
  }
  
  return (<a
              href={theHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >{children}</a>);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const documentationUrl = process.env.DOCUMENTATION_URL;
  const imprintUrl = process.env.IMPRINT_URL;
  const privacyPolicyUrl = process.env.PRIVACY_POLICY_URL;
  const accessibilityUrl = process.env.ACCESSIBILITY_URL;
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <main className="flex-1">
          {children}
        </main>

        <footer className="fixed bottom-0 w-full bg-blue-950 px-8 py-4 text-white">
          <div className="flex gap-6 text-sm">
            
            <LegalLink href={documentationUrl} fallback="https://github.com/tkw1536/quickpid/tree/main/spec"
            >
              Documentation
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
        </footer>
      </body>
    </html>
  );
}