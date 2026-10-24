"use client";

import { useLocale, useTranslations } from "next-intl";
import FieldHelp from "@/app/components/field-help";
import { useResolveExample } from "@/app/components/resolve-example-provider";

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
  const placeholder = useResolveExample();

  return (
    <div className="card">
      <form
        method="GET"
        action={`/${locale}`}
        className="flex flex-col gap-3 sm:flex-row sm:items-start"
      >
        <div className="min-w-0 flex-1">
          <FieldHelp label={t("namespaceOrPid")} text={t("hint")} />
          <input
            type="text"
            name="q"
            defaultValue={defaultQuery}
            placeholder={placeholder}
            autoComplete="off"
            aria-label={t("namespaceOrPid")}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? ERROR_ID : undefined}
            className="field-input mt-1.5 w-full"
          />
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:w-40 sm:pt-7">
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
