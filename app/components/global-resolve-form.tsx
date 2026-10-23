"use client";

import { useLocale, useTranslations } from "next-intl";
import { resolveExamplePlaceholder } from "@/lib/resolve-example";

type GlobalResolveFormProps = {
  /** Prefill for the q field (e.g. from `/?q=` or a prior query). */
  defaultQuery?: string;
  error?: string;
};

const ERROR_ID = "global-resolve-error";

/**
 * Homepage-style Show Details control: GET form to `/{locale}/?q=…` (server resolves and redirects).
 */
export default function GlobalResolveForm({
  defaultQuery = "",
  error,
}: GlobalResolveFormProps) {
  const t = useTranslations("resolve");
  const locale = useLocale();

  return (
    <div className="card">
      <form
        method="GET"
        action={`/${locale}`}
        className="flex flex-col gap-3 sm:flex-row sm:items-start"
      >
        <input
          type="text"
          name="q"
          defaultValue={defaultQuery}
          placeholder={resolveExamplePlaceholder()}
          autoComplete="off"
          aria-label={t("namespaceOrPid")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? ERROR_ID : undefined}
          className="field-input"
        />
        <div className="flex shrink-0 flex-col gap-3 sm:w-40">
          <button type="submit" className="btn-primary w-full">
            {t("showDetails")}
          </button>
        </div>
      </form>

      {error && (
        <div id={ERROR_ID} className="alert-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
