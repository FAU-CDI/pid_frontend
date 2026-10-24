import { getLocale, getTranslations } from "next-intl/server";
import CopyButton from "@/app/components/copy-button";
import FieldHelp from "@/app/components/field-help";
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
  const th = await getTranslations("help");
  const tp = await getTranslations("pid");
  const locale = await getLocale();

  return (
    <div className="card detail-stack">
      <FieldHelp
        label={t("eyebrow")}
        text={th("namespace")}
        labelClassName="detail-eyebrow"
      />

      <div className="space-y-2">
        <FieldHelp label={t("idLabel")} text={th("namespaceId")} />
        <div className="detail-hero">
          <span className="detail-hero-value">
            <BackendCode>{namespace.id}</BackendCode>
          </span>
          <CopyButton value={namespace.id} label={tp("copyNamespaceId")} />
        </div>
      </div>

      {mountBaseUri ? (
        <div className="detail-field">
          <FieldHelp label={t("mount")} text={th("mount")} />
          <div className="detail-copy-row">
            <span className="detail-field-value">
              <BackendCode>{mountBaseUri}</BackendCode>
            </span>
            <CopyButton value={mountBaseUri} label={tp("copyMount")} />
          </div>
        </div>
      ) : null}

      <div className="detail-field">
        <FieldHelp label={t("pidFormat")} text={th("pidFormat")} />
        <pre className="detail-code">
          <BackendCode>{namespace.pidFormat.pattern}</BackendCode>
          {" · "}
          <BackendEnglish>{namespace.pidFormat.characters}</BackendEnglish>
        </pre>
      </div>

      <div className="detail-section">
        {namespace.tags.length > 0 ? (
          <div className="detail-field">
            <FieldHelp label={t("tags")} text={th("tags")} />
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
          createdHelp={th("createdNamespace")}
          updatedHelp={th("updatedNamespace")}
        />
      </div>
    </div>
  );
}

function DetailDates({
  dateCreated,
  dateUpdated,
  locale,
  createdLabel,
  updatedLabel,
  createdHelp,
  updatedHelp,
}: {
  dateCreated: string;
  dateUpdated: string;
  locale: string;
  createdLabel: string;
  updatedLabel: string;
  createdHelp: string;
  updatedHelp: string;
}) {
  return (
    <div className="detail-meta">
      <div className="detail-meta-item">
        <FieldHelp
          label={createdLabel}
          text={createdHelp}
          labelClassName="detail-meta-label"
        />
        <span>{formatDate(dateCreated, locale)}</span>
      </div>
      <div className="detail-meta-item">
        <FieldHelp
          label={updatedLabel}
          text={updatedHelp}
          labelClassName="detail-meta-label"
        />
        <span>{formatDate(dateUpdated, locale)}</span>
      </div>
    </div>
  );
}

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleString(locale);
}
