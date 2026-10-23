type StatusInfoCardProps = {
  /** Kept for call-site compatibility; not shown in the UI. */
  status?: number;
  title: string;
  message: string;
};

export default function StatusInfoCard({
  title,
  message,
}: StatusInfoCardProps) {
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
