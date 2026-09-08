import { getTranslations } from "next-intl/server";

type Props = {
    params: Promise<{
        lang: string;
    }>;
};

export default async function DashboardPage({ params }: Props) {
    const { lang } = await params;

    const t = await getTranslations({
        locale: lang,
        namespace: "dashboard",
    });

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    {t("title")}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {t("subtitle")}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <p className="text-sm text-gray-500">
                        {t("stats.upcomingBookings")}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        0
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <p className="text-sm text-gray-500">
                        {t("stats.eventTypes")}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        0
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <p className="text-sm text-gray-500">
                        {t("stats.customers")}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        0
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <p className="text-sm text-gray-500">
                        {t("stats.teamMembers")}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        1
                    </p>
                </div>
            </div>
        </div>
    );
}