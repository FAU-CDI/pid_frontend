import Link from "next/link";

export type Breadcrumb = {
  /** When omitted, the crumb is the current (non-linked) page. */
  href?: string;
  label: string;
};

export type ResolverPageProps = {
  /** Non-empty trail; first crumb should be Home (`/`). */
  breadcrumbs: [Breadcrumb, ...Breadcrumb[]];
  /** Always-present resolve interface. */
  resolve: React.ReactElement;
  /** Info / status card(s) below the resolve panel. */
  info: React.ReactElement;
};

/**
 * Canonical browsable page shell: breadcrumbs + required resolve and info slots.
 * Pages should only return this component (plus hard error boundaries).
 */
export default function ResolverPage({
  breadcrumbs,
  resolve,
  info,
}: ResolverPageProps) {
  return (
    <>
      <nav className="app-breadcrumbs" aria-label="Breadcrumb">
        <ol className="app-breadcrumbs-list">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-x-2">
                {index > 0 && (
                  <span className="app-breadcrumb-sep" aria-hidden="true">
                    /
                  </span>
                )}
                {isLast || !crumb.href ? (
                  <span className="app-breadcrumb-current" aria-current={isLast ? "page" : undefined}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="app-breadcrumb-link">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="page-main">
        <div className="page-column">
          {resolve}
          {info}
        </div>
      </div>
    </>
  );
}

export function homeBreadcrumb(): Breadcrumb {
  return { href: "/", label: "Home" };
}
