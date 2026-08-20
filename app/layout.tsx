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
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <main className="flex-1">
          {children}
        </main>

        <footer className="w-full bg-blue-950 px-8 py-4 text-white">
          <div className="flex gap-6 text-sm">
            <a
              href="https://www.cdi.fau.de/impressum/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Impressum
            </a>

            <a
              href="https://www.cdi.fau.de/datenschutz/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Datenschutz
            </a>

            <a
              href="https://www.cdi.fau.de/barrierefreiheit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Barrierefreiheit
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}