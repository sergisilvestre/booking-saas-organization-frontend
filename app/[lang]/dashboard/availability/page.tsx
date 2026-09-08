import { getTranslations } from "next-intl/server";

type Props = {
    params: Promise<{
        lang: string;
    }>;
};

export default async function AvailabilityPage({ params }: Props) {
    const { lang } = await params;

    const t = await getTranslations({
        locale: lang,
        namespace: "dashboard.availability",
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

            <div className="rounded-2xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            {t("weekly.title")}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            {t("weekly.subtitle")}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        {t("actions.add")}
                    </button>
                </div>

                <div className="divide-y divide-gray-100">
                    {[
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "sunday",
                    ].map((day) => (
                        <div
                            key={day}
                            className="flex items-center justify-between px-6 py-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-28">
                                    <span className="text-sm font-medium text-gray-900">
                                        {t(`days.${day}`)}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-500">
                                    {day === "saturday" || day === "sunday"
                                        ? t("closed")
                                        : "09:00 – 17:00"}
                                </div>
                            </div>

                            <button
                                type="button"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                {t("actions.edit")}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-5">
                    <h3 className="text-base font-semibold text-gray-900">
                        {t("exceptions.title")}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        {t("exceptions.subtitle")}
                    </p>
                </div>

                <div className="px-6 py-10 text-center">
                    <p className="text-sm text-gray-500">
                        {t("exceptions.empty")}
                    </p>

                    <button
                        type="button"
                        className="mt-4 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                        {t("actions.addException")}
                    </button>
                </div>
            </div>
        </div>
    );
}