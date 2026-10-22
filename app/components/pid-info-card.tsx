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
      <div className="card space-y-4">
        <h2 className="card-title">PID Details</h2>
        <div className="detail-row">
          <span className="detail-label">PID:</span>{" "}
          <span className="font-mono">{props.pid}</span>
        </div>
        <div className="alert-error mt-0">
          {props.message ?? "The requested PID does not exist in this context."}
        </div>
      </div>
    );
  }

  const { data } = props;

  return (
    <div className="card space-y-4">
      <h2 className="card-title">PID Details</h2>

      <div className="detail-row">
        <span className="detail-label">PID:</span>{" "}
        <span className="font-mono">{data.pid}</span>
      </div>

      <div className="detail-row">
        <span className="detail-label">URL:</span>{" "}
        {data.url ? (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-link"
          >
            {data.url}
          </a>
        ) : (
          "Not available"
        )}
      </div>

      <div className="detail-row">
        <span className="detail-label">Metadata:</span>{" "}
        {data.metadata ?? "Not available"}
      </div>

      <div className="detail-row">
        <span className="detail-label">Date Created:</span>{" "}
        {new Date(data.dateCreated).toLocaleString()}
      </div>

      <div className="detail-row">
        <span className="detail-label">Date Updated:</span>{" "}
        {new Date(data.dateUpdated).toLocaleString()}
      </div>

      <div className="detail-row">
        <span className="detail-label">Tags:</span>{" "}
        {data.tags.length > 0 ? data.tags.join(", ") : "None"}
      </div>

      <div className="detail-row">
        <span className="detail-label">Deleted:</span>{" "}
        {data.deleted ? "Yes" : "No"}
      </div>
    </div>
  );
}
