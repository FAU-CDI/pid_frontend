type ErrorPageProps = {
  status: number;
  title: string;
  message: string;
};

export default function ErrorPage({
  status,
  title,
  message,
}: ErrorPageProps) {
  return (
    <div className="page-shell">
      <main className="page-main">
        <div className="page-column">
          <div className="page-header">
            <h1 className="page-title">PID Resolver</h1>
            <p className="page-lede">
              Resolve and explore persistent identifiers.
            </p>
          </div>

          <div className="card text-center">
            <div className="error-status">{status}</div>
            <h2 className="card-title mt-4">{title}</h2>
            <p className="card-body">{message}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
