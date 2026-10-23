import { getTranslations } from "next-intl/server";
import type { Breadcrumb } from "@/app/components/resolver-page";

/** Server helper: Home crumb with localized label. */
export async function homeBreadcrumb(): Promise<Breadcrumb> {
  const t = await getTranslations("nav");
  return { href: "/", label: t("home") };
}

export async function errorBreadcrumb(): Promise<Breadcrumb> {
  const t = await getTranslations("nav");
  return { label: t("errorCrumb") };
}

export async function notFoundBreadcrumb(): Promise<Breadcrumb> {
  const t = await getTranslations("nav");
  return { label: t("notFoundCrumb") };
}

export async function urlBreadcrumb(): Promise<Breadcrumb> {
  const t = await getTranslations("nav");
  return { label: t("urlCrumb") };
}
