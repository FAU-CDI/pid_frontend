"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type Breadcrumb = {
  /** When omitted, the crumb is the current (non-linked) page. */
  href?: string;
  label: React.ReactNode;
};

export type ResolverPageProps = {
  /**
   * Non-empty trail; first crumb should be Home (`/`).
   * Omit on the homepage to hide the breadcrumb bar (uses a screen-reader `h1`).
   */
  breadcrumbs?: [Breadcrumb, ...Breadcrumb[]];
  /**
   * Optional large page heading.
   * When set, this is the sole `h1`; the current breadcrumb stays a span.
   */
  heading?: React.ReactNode;
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
  heading,
  resolve,
  info,
}: ResolverPageProps) {
  const t = useTranslations("nav");

  return (
    <>
      {breadcrumbs ? (
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
                    isLast && !heading ? (
                      <h1
                        className="app-breadcrumb-current"
                        aria-current="page"
                      >
                        {crumb.label}
                      </h1>
                    ) : (
                      <span
                        className="app-breadcrumb-current"
                        {...(isLast ? { "aria-current": "page" as const } : {})}
                      >
                        {crumb.label}
                      </span>
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
      ) : null}

      <div className="page-main">
        <div className="page-column">
          {heading ? (
            <div className="page-header">
              <h1 className="page-title">{heading}</h1>
            </div>
          ) : !breadcrumbs ? (
            <h1 className="sr-only">{t("productName")}</h1>
          ) : null}
          {resolve}
          {info}
        </div>
      </div>
    </>
  );
}
