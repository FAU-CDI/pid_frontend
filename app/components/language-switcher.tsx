"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ChangeEvent } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeFlags, locales, type AppLocale } from "@/i18n/routing";
import { isSupportedLocale } from "@/lib/locales";

export default function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const labelFor = (code: AppLocale): string => {
    if (code === "en") return t("localeEn");
    if (code === "de") return t("localeDe");
    return code;
  };

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    if (!isSupportedLocale(next) || next === locale) {
      return;
    }
    router.replace(pathname, { locale: next });
  }

  return (
    <label className="language-switcher">
      <span className="sr-only">{t("language")}</span>
      <select
        className="language-switcher-select"
        value={locale}
        onChange={onChange}
        aria-label={t("language")}
      >
        {locales.map((code) => (
          <option key={code} value={code} lang={code}>
            {localeFlags[code]} {labelFor(code)}
          </option>
        ))}
      </select>
    </label>
  );
}
