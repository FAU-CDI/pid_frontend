import CopyButton from "@/app/components/copy-button";
import ExpandableMono from "@/app/components/expandable-mono";
import { pidNoLongerAvailable } from "@/lib/user-facing";

export type PidInfoData = {
  pid: string;
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
      pid: string;
      message?: string;
    };

export default function PidInfoCard(props: PidInfoCardProps) {
  if (props.status === "not-found") {
    return (
      <div className="card detail-stack">
        <p className="detail-eyebrow">PID</p>
        <PidHero value={props.pid} />
        <div className="alert-error mt-0">
          {props.message ?? "This PID was not found."}
        </div>
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
        <PidHero value={data.pid} muted />
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
      <PidHero value={data.pid} />

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
          <span className="detail-field-muted">No URL</span>
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
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {data.tags.join(", ")}
          </span>
        </div>
      ) : null}

      <DetailDates
        dateCreated={data.dateCreated}
        dateUpdated={data.dateUpdated}
      />
    </div>
  );
}

function PidHero({ value, muted = false }: { value: string; muted?: boolean }) {
  return (
    <div className="detail-hero">
      <span
        className={
          muted
            ? "detail-hero-value detail-hero-muted"
            : "detail-hero-value"
        }
      >
        {value}
      </span>
      <CopyButton value={value} label="PID" />
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
