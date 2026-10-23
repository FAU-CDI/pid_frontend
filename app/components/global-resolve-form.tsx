import { resolveExamplePlaceholder } from "@/lib/resolve-example";

type GlobalResolveFormProps = {
  /** Prefill for the q field (e.g. from `/?q=` or a prior query). */
  defaultQuery?: string;
  error?: string;
};

/**
 * Homepage-style Show Details control: GET form to `/?q=…` (server resolves and redirects).
 */
export default function GlobalResolveForm({
  defaultQuery = "",
  error,
}: GlobalResolveFormProps) {
  return (
    <div className="card">
      <form
        method="GET"
        action="/"
        className="flex flex-col gap-3 sm:flex-row sm:items-start"
      >
        <input
          type="text"
          name="q"
          defaultValue={defaultQuery}
          placeholder={resolveExamplePlaceholder()}
          autoComplete="off"
          aria-label="Namespace or PID"
          className="field-input"
        />
        <div className="flex shrink-0 flex-col gap-3 sm:w-40">
          <button type="submit" className="btn-primary w-full">
            Show Details
          </button>
        </div>
      </form>

      {error && <div className="alert-error">{error}</div>}
    </div>
  );
}
