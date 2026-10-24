"use client";

import { useLocale, useTranslations } from "next-intl";
import CopyButton from "@/app/components/copy-button";
import ExpandableMono from "@/app/components/expandable-mono";
import FieldHelp from "@/app/components/field-help";
import { BackendCode, BackendContent } from "@/app/components/lang";
import OpensInNewTabHint from "@/app/components/opens-in-new-tab-hint";

export type PidInfoData = {
  pid: string;
  /** Muted path prefix: namespace id or mount path. */
  scope: string;
  /** Pasteable into the homepage Resolve field. */
  absolute: string;
  url: string | null;
  metadata: string | null;
  dateCreated: string;
  dateUpdated: string;
  tags: string[];
  deleted: boolean;
};

type PidInfoCardProps =
  | {
      status: "found";
      data: PidInfoData;
    }
  | {
      status: "not-found";
      message?: string;
    };

export default function PidInfoCard(props: PidInfoCardProps) {
  const t = useTranslations("pid");
  const th = useTranslations("help");
  const te = useTranslations("errors");
  const locale = useLocale();

  if (props.status === "not-found") {
    const title = te("pidNotFound.title");
    const message = props.message ?? te("pidNotFound.message");
    return (
      <div className="card detail-stack">
        <div className="detail-header">
          <p className="detail-eyebrow">{title}</p>
          <span className="status-error-badge">{title}</span>
        </div>
        <div className="status-error" role="alert">
          {message}
        </div>
      </div>
    );
  }

  const { data } = props;

  if (data.deleted) {
    return (
      <div className="card detail-stack">
        <div className="detail-header items-start">
          <div className="min-w-0 flex-1">
            <FieldHelp
              label={t("eyebrow")}
              text={th("pid")}
              labelClassName="detail-eyebrow"
            />
          </div>
          <span className="status-gone-badge shrink-0">
            {te("pidNoLongerAvailable.badge")}
          </span>
        </div>
        <PidHero
          scope={data.scope}
          pid={data.pid}
          absolute={data.absolute}
          muted
        />
        <div className="status-gone" role="status">
          {te("pidNoLongerAvailable.message")}
        </div>
        <div className="detail-section">
          <DetailDates
            dateCreated={data.dateCreated}
            dateUpdated={data.dateUpdated}
            locale={locale}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card detail-stack">
      <FieldHelp
        label={t("eyebrow")}
        text={th("pid")}
        labelClassName="detail-eyebrow"
      />
      <PidHero scope={data.scope} pid={data.pid} absolute={data.absolute} />

      <div className="detail-section">
        <div className="detail-field">
          <FieldHelp label={t("url")} text={th("url")} />
          {data.url ? (
            <div className="detail-copy-row">
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-link"
                lang="zxx"
              >
                <BackendCode>{data.url}</BackendCode>
                <OpensInNewTabHint />
              </a>
              <CopyButton value={data.url} label={t("copyUrl")} />
            </div>
          ) : (
            <span className="detail-field-muted">{t("none")}</span>
          )}
        </div>

        {data.metadata ? (
          <div className="detail-field">
            <FieldHelp label={t("metadata")} text={th("metadata")} />
            <ExpandableMono
              value={data.metadata}
              copyLabel={t("copyMetadata")}
            />
          </div>
        ) : null}
      </div>

      <div className="detail-section">
        {data.tags.length > 0 ? (
          <div className="detail-field">
            <FieldHelp label={t("tags")} text={th("tags")} />
            <TagList tags={data.tags} />
          </div>
        ) : null}

        <DetailDates
          dateCreated={data.dateCreated}
          dateUpdated={data.dateUpdated}
          locale={locale}
        />
      </div>
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="detail-tag-list">
      {tags.map((tag) => (
        <span key={tag} className="detail-tag">
          <BackendContent>{tag}</BackendContent>
        </span>
      ))}
    </div>
  );
}

function PidHero({
  scope,
  pid,
  absolute,
  muted = false,
}: {
  scope: string;
  pid: string;
  absolute: string;
  muted?: boolean;
}) {
  const t = useTranslations("pid");

  return (
    <div className="detail-hero">
      <p
        className={
          muted ? "detail-hero-path detail-hero-muted" : "detail-hero-path"
        }
      >
        <span className="detail-hero-scope">
          <BackendCode>{scope}</BackendCode>
        </span>
        <span className="detail-hero-sep" aria-hidden="true">
          /
        </span>
        <span className="detail-hero-pid">
          <BackendCode>{pid}</BackendCode>
        </span>
      </p>
      <div className="copy-button-group" role="group" aria-label={t("copyGroup")}>
        <CopyButton value={pid} label={t("copyPid")} caption={t("copyPid")} />
        <CopyButton
          value={absolute}
          label={t("copyFullLabel")}
          caption={t("copyFull")}
        />
      </div>
    </div>
  );
}

function DetailDates({
  dateCreated,
  dateUpdated,
  locale,
}: {
  dateCreated: string;
  dateUpdated: string;
  locale: string;
}) {
  const t = useTranslations("pid");
  const th = useTranslations("help");

  return (
    <div className="detail-meta">
      <div className="detail-meta-item">
        <FieldHelp
          label={t("created")}
          text={th("createdPid")}
          labelClassName="detail-meta-label"
        />
        <span>{formatDate(dateCreated, locale)}</span>
      </div>
      <div className="detail-meta-item">
        <FieldHelp
          label={t("updated")}
          text={th("updatedPid")}
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
