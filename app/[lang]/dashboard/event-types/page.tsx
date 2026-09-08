import { getTranslations } from "next-intl/server";

type Props = {
    params: Promise<{
        lang: string;
    }>;
};

export default async function EventTypesPage({ params }: Props) {
    const { lang } = await params;

    const t = await getTranslations({
        locale: lang,
        namespace: "dashboard.eventTypes",
    });

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        {t("title")}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {t("subtitle")}
                    </p>
                </div>

                <button
                    type="button"
                    className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                    {t("create")}
                </button>
            </div>

            {/* Event types */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Empty state */}
                <div className="col-span-full rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                    <p className="text-sm font-medium text-gray-900">
                        {t("empty.title")}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        {t("empty.description")}
                    </p>

                    <button
                        type="button"
                        className="mt-5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        {t("empty.action")}
                    </button>
                </div>
            </div>
        </div>
    );
}