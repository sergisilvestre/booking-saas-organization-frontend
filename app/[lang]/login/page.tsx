import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LoginAuth from "./LoginAuth";
import LoginForm from "./LoginForm";

type Props = {
    params: Promise<{
        lang: string;
    }>;
};

export default async function LoginPage({ params }: Props) {
    const { lang } = await params;

    const t = await getTranslations({
        locale: lang,
        namespace: "login",
    });

    return (
        <LoginAuth lang={lang}>
            <main className="min-h-screen bg-gray-50">
                <div className="flex min-h-screen items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <Link
                                href={`/${lang}`}
                                className="text-2xl font-bold tracking-tight text-gray-900"
                            >
                                Booking
                            </Link>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                    {t("title")}
                                </h1>

                                <p className="mt-2 text-sm text-gray-500">
                                    {t("subtitle")}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                {/* Google SVG */}
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fill="#4285F4"
                                        d="M21.35 12.27c0-.71-.06-1.4-.18-2.05H12v3.88h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.19Z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.51A9.74 9.74 0 0 0 12 21.5Z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M6.53 13.6A5.86 5.86 0 0 1 6.22 12c0-.56.1-1.1.31-1.6V7.89H3.28A9.5 9.5 0 0 0 2.25 12c0 1.53.37 2.98 1.03 4.11l3.25-2.51Z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 6.38c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.45 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.72 5.39l3.25 2.51c.77-2.31 2.93-4.02 5.47-4.02Z"
                                    />
                                </svg>

                                {t("continueWithGoogle")}
                            </button>

                            <div className="my-7 flex items-center gap-4">
                                <div className="h-px flex-1 bg-gray-200" />

                                <span className="text-xs text-gray-400">
                                    {t("or")}
                                </span>

                                <div className="h-px flex-1 bg-gray-200" />
                            </div>

                            <LoginForm lang={lang} />

                            <p className="mt-8 text-center text-sm text-gray-500">
                                {t("noAccount")}{" "}
                                <Link
                                    href={`/${lang}/register`}
                                    className="font-semibold text-gray-900 hover:underline"
                                >
                                    {t("createAccount")}
                                </Link>
                            </p>
                        </div>

                        <p className="mt-6 text-center text-xs text-gray-400">
                            {t("termsPrefix")}{" "}
                            <Link
                                href={`/${lang}/terms`}
                                className="underline hover:text-gray-600"
                            >
                                {t("terms")}
                            </Link>{" "}
                            {t("and")}{" "}
                            <Link
                                href={`/${lang}/privacy`}
                                className="underline hover:text-gray-600"
                            >
                                {t("privacy")}
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </main>
        </LoginAuth>
    );
}