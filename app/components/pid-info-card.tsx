import CopyButton from "@/app/components/copy-button";
import ExpandableMono from "@/app/components/expandable-mono";
import { pidNoLongerAvailable, pidNotFound } from "@/lib/user-facing";

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
  if (props.status === "not-found") {
    const title = pidNotFound.title;
    const message = props.message ?? pidNotFound.message;
    return (
      <div className="card detail-stack">
        <div className="detail-header">
          <p className="detail-eyebrow">{title}</p>
          <span className="status-error-badge">{title}</span>
        </div>
        <div className="status-error">{message}</div>
      </div>
    );
  }

  const { data } = props;

  if (data.deleted) {
    return (
      <div className="card detail-stack">
        <div className="detail-header">
          <p className="detail-eyebrow">PID</p>
          <span className="status-gone-badge">{pidNoLongerAvailable.badge}</span>
        </div>
        <PidHero
          scope={data.scope}
          pid={data.pid}
          absolute={data.absolute}
          muted
        />
        <div className="status-gone">{pidNoLongerAvailable.message}</div>
        <DetailDates
          dateCreated={data.dateCreated}
          dateUpdated={data.dateUpdated}
        />
      </div>
    );
  }

  return (
    <div className="card detail-stack">
      <p className="detail-eyebrow">PID</p>
      <PidHero
        scope={data.scope}
        pid={data.pid}
        absolute={data.absolute}
      />

      <div className="detail-field">
        <span className="detail-field-label">URL</span>
        {data.url ? (
          <div className="detail-copy-row">
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-link"
            >
              {data.url}
            </a>
            <CopyButton value={data.url} label="URL" />
          </div>
        ) : (
          <span className="detail-field-muted">None</span>
        )}
      </div>

      {data.metadata ? (
        <div className="detail-field">
          <span className="detail-field-label">Metadata</span>
          <ExpandableMono value={data.metadata} copyLabel="metadata" />
        </div>
      ) : null}

      {data.tags.length > 0 ? (
        <div className="detail-field">
          <span className="detail-field-label">Tags</span>
          <TagList tags={data.tags} />
        </div>
      ) : null}

      <DetailDates
        dateCreated={data.dateCreated}
        dateUpdated={data.dateUpdated}
      />
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="detail-tag-list">
      {tags.map((tag) => (
        <span key={tag} className="detail-tag">
          {tag}
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
  return (
    <div className="detail-hero">
      <p
        className={
          muted
            ? "detail-hero-path detail-hero-muted"
            : "detail-hero-path"
        }
      >
        <span className="detail-hero-scope">{scope}</span>
        <span className="detail-hero-sep" aria-hidden="true">
          /
        </span>
        <span className="detail-hero-pid">{pid}</span>
      </p>
      <div className="copy-button-group" role="group" aria-label="Copy">
        <CopyButton value={pid} label="PID" caption="PID" />
        <CopyButton value={absolute} label="full path" caption="Full" />
      </div>
    </div>
  );
}

function DetailDates({
  dateCreated,
  dateUpdated,
}: {
  dateCreated: string;
  dateUpdated: string;
}) {
  return (
    <div className="detail-meta">
      <div className="detail-meta-row">
        <span className="detail-meta-label">Created</span>
        <span>{formatDate(dateCreated)}</span>
      </div>
      <div className="detail-meta-row">
        <span className="detail-meta-label">Updated</span>
        <span>{formatDate(dateUpdated)}</span>
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}
