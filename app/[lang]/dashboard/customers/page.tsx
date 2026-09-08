import { getTranslations } from "next-intl/server";

type Props = {
    params: Promise<{
        lang: string;
    }>;
};

export default async function CustomersPage({ params }: Props) {
    const { lang } = await params;

    const t = await getTranslations({
        locale: lang,
        namespace: "dashboard.customers",
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
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            {t("list.title")}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                            {t("list.subtitle")}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        {t("actions.add")}
                    </button>
                </div>

                <div className="px-6 py-16 text-center">
                    <p className="text-sm font-medium text-gray-900">
                        {t("empty.title")}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        {t("empty.description")}
                    </p>
                </div>
            </div>
        </div>
    );
}