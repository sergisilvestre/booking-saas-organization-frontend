import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import Sidebar from "@/app/[lang]/dashboard/Sidebar";

type Props = {
    children: ReactNode;
    params: Promise<{
        lang: string;
    }>;
};

export default async function DashboardLayout({
    children,
    params,
}: Props) {
    const { lang } = await params;

    const t = await getTranslations({
        locale: lang,
        namespace: "dashboard",
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar lang={lang} />

            <div className="pl-64">
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
                    <h1 className="text-lg font-semibold text-gray-900">
                        {t("header.title")}
                    </h1>

                    <div className="text-sm text-gray-500">
                        {t("header.account")}
                    </div>
                </header>

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}