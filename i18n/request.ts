import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
    const locale = await requestLocale;

    const validLocale =
        locale === "ca" ||
        locale === "es" ||
        locale === "en"
            ? locale
            : "ca";

    return {
        locale: validLocale,
        messages: (
            await import(`../messages/${validLocale}.json`)
        ).default,
    };
});