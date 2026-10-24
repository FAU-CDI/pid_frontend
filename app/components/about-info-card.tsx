import { getLocale, getTranslations } from "next-intl/server";
import OpensInNewTabHint from "@/app/components/opens-in-new-tab-hint";
import { Link } from "@/i18n/navigation";
import { optionalFooterHref } from "@/lib/footer-links";
import { type AppLocale, defaultLocale, isSupportedLocale } from "@/lib/locales";
import {
  parseResolveExample,
  resolveExamplePlaceholder,
} from "@/lib/resolve-example";

/** Locale-specific Wikipedia articles for “persistent identifier”. */
const WIKI_PID_URL: Record<AppLocale, string> = {
  en: "https://en.wikipedia.org/wiki/Persistent_identifier",
  de: "https://de.wikipedia.org/wiki/Persistent_Identifier",
};

const RESOLVER_SOURCE_URL = "https://github.com/FAU-CDI/pid_resolver";
const QUICKPID_SOURCE_URL = "https://github.com/tkw1536/quickpid";

type AboutInfoCardProps = {
  /** Total issued PIDs when the count API succeeds. */
  pidCount?: number;
};

function OutboundLink({ href, title }: { href: string; title: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="card-outbound"
    >
      <span>
        {title}
        <OpensInNewTabHint />
      </span>
      <span className="shrink-0 text-xl" aria-hidden="true">
        →
      </span>
    </a>
  );
}

export default async function AboutInfoCard({ pidCount }: AboutInfoCardProps) {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const appLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  const count =
    typeof pidCount === "number"
      ? pidCount.toLocaleString(locale)
      : undefined;
  const aboutUrl = optionalFooterHref(process.env.ABOUT_URL);
  const publicApiUrl = optionalFooterHref(process.env.PUBLIC_API_URL);
  const wikiHref = WIKI_PID_URL[appLocale];
  const exampleParts = parseResolveExample(resolveExamplePlaceholder());
  const showCount = count !== undefined;
  const showExample = exampleParts !== null;
  const secondaryCount = Number(showCount) + Number(showExample);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="card-title">{t("pidsTitle")}</h2>
        <p className="card-body">{t("pidsBody")}</p>
        <div className="card-outbound-list">
          <OutboundLink href={wikiHref} title={t("wikiLinkTitle")} />
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">{t("aboutTitle")}</h2>
        <p className="card-body">{t("aboutBody")}</p>
        <div className="card-outbound-list">
          {aboutUrl ? (
            <OutboundLink href={aboutUrl} title={t("aboutLinkTitle")} />
          ) : null}
          {publicApiUrl ? (
            <OutboundLink href={publicApiUrl} title={t("apiLinkTitle")} />
          ) : null}
          {aboutUrl || publicApiUrl ? (
            <div className="card-outbound-sep" role="separator" />
          ) : null}
          <OutboundLink
            href={RESOLVER_SOURCE_URL}
            title={t("resolverLinkTitle")}
          />
          <OutboundLink
            href={QUICKPID_SOURCE_URL}
            title={t("softwareLinkTitle")}
          />
        </div>
      </div>

      {secondaryCount > 0 ? (
        <div
          className={
            secondaryCount === 2 ? "grid gap-6 sm:grid-cols-2" : undefined
          }
        >
          {showCount ? (
            <div className="card">
              <h2 className="card-stat" aria-label={t("pidCountLabel", { count })}>
                {count}
              </h2>
              <p className="card-body">{t("pidCountBody")}</p>
            </div>
          ) : null}

          {showExample && exampleParts ? (
            <Link
              href={`/${exampleParts.mount}/${exampleParts.pid}`}
              className="card-muted"
            >
              <div className="flex h-full items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="card-title">{t("exampleTitle")}</h2>
                  <p className="card-body">{t("exampleBody")}</p>
                </div>
                <span className="shrink-0 text-xl" aria-hidden="true">
                  →
                </span>
              </div>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
