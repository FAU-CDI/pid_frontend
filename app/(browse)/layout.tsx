import Link from "next/link";

export default function BrowseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="page-shell">
      <header className="app-topbar">
        <Link href="/" className="app-topbar-title">
          PID Resolver
        </Link>
      </header>
      {children}
    </div>
  );
}
