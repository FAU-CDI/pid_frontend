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
    <div className="card space-y-4">
      <h2 className="card-title">Namespace</h2>

      <div className="detail-row">
        <span className="detail-label">ID:</span>{" "}
        <span className="font-mono">{namespace.id}</span>
      </div>

      {mountBaseUri && (
        <div className="detail-row">
          <span className="detail-label">Mount:</span>{" "}
          <span className="break-all font-mono text-sm">{mountBaseUri}</span>
        </div>
      )}

      <div className="detail-row">
        <span className="detail-label">PID format:</span>{" "}
        <span className="font-mono">
          {namespace.pidFormat.pattern} ({namespace.pidFormat.characters})
        </span>
      </div>

      <div className="detail-row">
        <span className="detail-label">Tags:</span>{" "}
        {namespace.tags.length > 0 ? namespace.tags.join(", ") : "None"}
      </div>

      <div className="detail-row">
        <span className="detail-label">Date Created:</span>{" "}
        {new Date(namespace.dateCreated).toLocaleString()}
      </div>

      <div className="detail-row">
        <span className="detail-label">Date Updated:</span>{" "}
        {new Date(namespace.dateUpdated).toLocaleString()}
      </div>
    </div>
  );
}
