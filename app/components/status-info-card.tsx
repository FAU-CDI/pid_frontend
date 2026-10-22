type StatusInfoCardProps = {
  status?: number;
  title: string;
  message: string;
};

export default function StatusInfoCard({
  status,
  title,
  message,
}: StatusInfoCardProps) {
  return (
    <div className="card space-y-4">
      <h2 className="card-title">{title}</h2>
      {typeof status === "number" && (
        <div className="error-status text-4xl">{status}</div>
      )}
      <p className="card-body mt-0">{message}</p>
    </div>
  );
}
