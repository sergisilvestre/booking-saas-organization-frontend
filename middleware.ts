import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["ca", "es", "en"],
  defaultLocale: "ca",
});

export const config = {
  matcher: ["/", "/(ca|es|en)/:path*"],
};
