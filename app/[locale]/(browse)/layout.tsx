import LanguageSwitcher from "@/app/components/language-switcher";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function BrowseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("nav");

  return (
    <div className="page-shell">
      <header className="app-topbar">
        <div className="app-topbar-inner">
          <Link href="/" className="app-topbar-title">
            {t("productName")}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main id="main-content">{children}</main>
    </div>
  );
}
