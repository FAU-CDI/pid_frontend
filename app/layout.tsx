import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PID Resolver",
  description: "Resolve and explore persistent identifiers.",
};

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
            <a
              href={documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Documentation
            </a>

            <a
              href={imprintUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Imprint
            </a>

            <a
              href={privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Privacy Policy
            </a>

            <a
              href={accessibilityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Accessibility
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}