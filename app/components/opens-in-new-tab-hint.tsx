"use client";

import { useTranslations } from "next-intl";

/** Screen-reader-only hint for links that open in a new tab. */
export default function OpensInNewTabHint() {
  const t = useTranslations("a11y");
  return <span className="sr-only">{t("opensInNewTab")}</span>;
}
