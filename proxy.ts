import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except Next internals and static files with a dot.
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
