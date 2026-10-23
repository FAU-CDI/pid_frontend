import { getLocale, getTranslations } from "next-intl/server";
import CopyButton from "@/app/components/copy-button";
import {
  BackendCode,
  BackendContent,
  BackendEnglish,
} from "@/app/components/lang";
import type { Namespace } from "@/lib/backend/client";

type NamespaceInfoCardProps = {
  namespace: Namespace;
  /** Optional mount base URI when viewing via a mount path. */
  mountBaseUri?: string;
};

export default async function NamespaceInfoCard({
  namespace,
  mountBaseUri,
}: NamespaceInfoCardProps) {
  const t = await getTranslations("namespace");
  const tp = await getTranslations("pid");
  const locale = await getLocale();

  return (
    <div className="card detail-stack">
      <p className="detail-eyebrow">{t("eyebrow")}</p>

      <div className="detail-hero">
        <span className="sr-only">{t("idLabel")}</span>
        <span className="detail-hero-value">
          <BackendCode>{namespace.id}</BackendCode>
        </span>
        <CopyButton value={namespace.id} label={tp("copyNamespaceId")} />
      </div>

      {mountBaseUri ? (
        <div className="detail-field">
          <span className="detail-field-label">{t("mount")}</span>
          <div className="detail-copy-row">
            <span className="detail-field-value">
              <BackendCode>{mountBaseUri}</BackendCode>
            </span>
            <CopyButton value={mountBaseUri} label={tp("copyMount")} />
          </div>
        </div>
      ) : null}

      <div className="detail-field">
        <span className="detail-field-label">{t("pidFormat")}</span>
        <pre className="detail-code">
          <BackendCode>{namespace.pidFormat.pattern}</BackendCode>
          {" · "}
          <BackendEnglish>{namespace.pidFormat.characters}</BackendEnglish>
        </pre>
      </div>

      {namespace.tags.length > 0 ? (
        <div className="detail-field">
          <span className="detail-field-label">{t("tags")}</span>
          <div className="detail-tag-list">
            {namespace.tags.map((tag) => (
              <span key={tag} className="detail-tag">
                <BackendContent>{tag}</BackendContent>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <DetailDates
        dateCreated={namespace.dateCreated}
        dateUpdated={namespace.dateUpdated}
        locale={locale}
        createdLabel={t("created")}
        updatedLabel={t("updated")}
      />
    </div>
  );
}

function DetailDates({
  dateCreated,
  dateUpdated,
  locale,
  createdLabel,
  updatedLabel,
}: {
  dateCreated: string;
  dateUpdated: string;
  locale: string;
  createdLabel: string;
  updatedLabel: string;
}) {
  return (
    <div className="detail-meta">
      <div className="detail-meta-row">
        <span className="detail-meta-label">{createdLabel}</span>
        <span>{formatDate(dateCreated, locale)}</span>
      </div>
      <div className="detail-meta-row">
        <span className="detail-meta-label">{updatedLabel}</span>
        <span>{formatDate(dateUpdated, locale)}</span>
      </div>
    </div>
  );
}

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleString(locale);
}
