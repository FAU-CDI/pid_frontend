"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type Breadcrumb = {
  /** When omitted, the crumb is the current (non-linked) page. */
  href?: string;
  label: React.ReactNode;
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
  const t = useTranslations("nav");

  return (
    <>
      <nav className="app-breadcrumbs" aria-label={t("breadcrumb")}>
        <ol className="app-breadcrumbs-list">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <li
                key={index}
                className="flex items-center gap-x-2"
              >
                {index > 0 && (
                  <span className="app-breadcrumb-sep" aria-hidden="true">
                    /
                  </span>
                )}
                {isLast || !crumb.href ? (
                  isLast ? (
                    <h1
                      className="app-breadcrumb-current"
                      aria-current="page"
                    >
                      {crumb.label}
                    </h1>
                  ) : (
                    <span className="app-breadcrumb-current">{crumb.label}</span>
                  )
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
