import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales, type AppLocale } from "@/lib/locales";

export type { AppLocale };
export { locales, defaultLocale };

/** Unicode regional-indicator flags for the language switcher (locale → flag). */
export const localeFlags: Record<AppLocale, string> = {
  en: "🇬🇧",
  de: "🇩🇪",
};

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
  localeCookie: false,
  localeDetection: true,
});
