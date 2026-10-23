import { getLocale, getTranslations } from "next-intl/server";
import OpensInNewTabHint from "@/app/components/opens-in-new-tab-hint";

type AboutInfoCardProps = {
  /** Total issued PIDs when the count API succeeds. */
  pidCount?: number;
};

export default async function AboutInfoCard({ pidCount }: AboutInfoCardProps) {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const count =
    typeof pidCount === "number"
      ? pidCount.toLocaleString(locale)
      : undefined;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="card-title">{t("aboutTitle")}</h2>
        <p className="card-body">{t("aboutBody")}</p>
        {count !== undefined ? (
          <p className="card-body">{t("pidCount", { count })}</p>
        ) : null}
      </div>

      <a
        href="https://github.com/tkw1536/quickpid/tree/main/spec"
        target="_blank"
        rel="noopener noreferrer"
        className="card-muted"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="card-title">
              {t("docsTitle")}
              <OpensInNewTabHint />
            </h2>
            <p className="card-hint">{t("docsHint")}</p>
          </div>
          <span className="text-xl" aria-hidden="true">
            →
          </span>
        </div>
      </a>
    </div>
  );
}
