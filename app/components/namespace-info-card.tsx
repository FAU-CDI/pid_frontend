import CopyButton from "@/app/components/copy-button";
import type { Namespace } from "@/lib/backend/client";

type NamespaceInfoCardProps = {
  namespace: Namespace;
  /** Optional mount base URI when viewing via a mount path. */
  mountBaseUri?: string;
};

export default function NamespaceInfoCard({
  namespace,
  mountBaseUri,
}: NamespaceInfoCardProps) {
  return (
    <div className="card detail-stack">
      <p className="detail-eyebrow">Namespace</p>

      <div className="detail-hero">
        <span className="sr-only">Namespace ID</span>
        <span className="detail-hero-value">{namespace.id}</span>
        <CopyButton value={namespace.id} label="namespace ID" />
      </div>

      {mountBaseUri ? (
        <div className="detail-field">
          <span className="detail-field-label">Mount</span>
          <div className="detail-copy-row">
            <span className="detail-field-value">{mountBaseUri}</span>
            <CopyButton value={mountBaseUri} label="Mount" />
          </div>
        </div>
      ) : null}

      <div className="detail-field">
        <span className="detail-field-label">PID format</span>
        <pre className="detail-code">
          {namespace.pidFormat.pattern} · {namespace.pidFormat.characters}
        </pre>
      </div>

      {namespace.tags.length > 0 ? (
        <div className="detail-field">
          <span className="detail-field-label">Tags</span>
          <div className="detail-tag-list">
            {namespace.tags.map((tag) => (
              <span key={tag} className="detail-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <DetailDates
        dateCreated={namespace.dateCreated}
        dateUpdated={namespace.dateUpdated}
      />
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
