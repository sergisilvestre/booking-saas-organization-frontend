
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import RegisterForm from "./RegisterForm";

type Props = {
    params: Promise<{
        lang: string;
    }>;
};

export default async function RegisterPage({ params }: Props) {
    const { lang } = await params;

    const t = await getTranslations({
        locale: lang,
        namespace: "register",
    });

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="flex min-h-screen items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">

                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <Link
                            href={`/${lang}`}
                            className="text-2xl font-bold tracking-tight text-gray-900"
                        >
                            Booking
                        </Link>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

                        {/* Header */}
                        <div className="text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                {t("title")}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                {t("description")}
                            </p>
                        </div>

                        {/* Form */}
                        <div className="mt-8">
                            <RegisterForm lang={lang} />
                        </div>

                        {/* Login */}
                        <p className="mt-8 text-center text-sm text-gray-500">
                            {t("login.question")}{" "}
                            <Link
                                href={`/ ${lang}/login`}
                                className="font-semibold text-gray-900 hover:underline"
                            >
                                {t("login.link")}
                            </Link >
                        </p >
                    </div >

                    {/* Terms */}
                    <p className="mt-6 text-center text-xs leading-5 text-gray-400" >
                        {t("terms")}
                    </p >
                </div >
            </div >
        </main >
    );
}
