import { getTranslations } from "next-intl/server";

type Props = {
    params: Promise<{ lang: string }>;
};

export default async function BillingPage({ params }: Props) {
    const { lang } = await params;

    const t = await getTranslations({
        locale: lang,
        namespace: "dashboard.billing",
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    {t("title")}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    {t("description")}
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                    <button
                        type="button"
                        className="border-b-2 border-gray-900 px-1 pb-3 text-sm font-medium text-gray-900"
                    >
                        {t("tabs.subscription")}
                    </button>

                    <button
                        type="button"
                        className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        {t("tabs.bookings")}
                    </button>
                </nav>
            </div>

            {/* Invoices */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-base font-semibold text-gray-900">
                        {t("subscriptionInvoices.title")}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {t("subscriptionInvoices.description")}
                    </p>
                </div>

                {/* Empty state for now */}
                <div className="px-6 py-12 text-center">
                    <h3 className="text-sm font-medium text-gray-900">
                        {t("empty.title")}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        {t("empty.description")}
                    </p>
                </div>
            </div>
        </div>
    );
}