import OpensInNewTabHint from "@/app/components/opens-in-new-tab-hint";

type AboutInfoCardProps = {
  /** Total issued PIDs when the count API succeeds. */
  pidCount?: number;
};

export default function AboutInfoCard({ pidCount }: AboutInfoCardProps) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="card-title">About PID Resolver</h2>
        <p className="card-body">
          This service allows users to resolve PIDs and retrieve information
          about the resources they identify.
        </p>
        {typeof pidCount === "number" ? (
          <p className="card-body">
            This resolver currently holds {pidCount.toLocaleString()} PIDs.
          </p>
        ) : null}
      </div>

      <a
        href="https://github.com/tkw1536/quickpid/tree/main/spec"
        target="_blank"
        rel="noopener noreferrer"
        className="card-muted"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="card-title">
              Documentation
              <OpensInNewTabHint />
            </h2>
            <p className="card-hint">
              Read the documentation and learn more about the PID Resolver.
            </p>
          </div>
          <span className="text-xl" aria-hidden="true">
            →
          </span>
        </div>
      </a>
    </div>
  );
}
