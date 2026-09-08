import { getTranslations } from "next-intl/server";

type Props = {
    params: Promise<{
        lang: string;
    }>;
};

export default async function BookingsPage({ params }: Props) {
    const { lang } = await params;

    const t = await getTranslations({
        locale: lang,
        namespace: "dashboard.bookings",
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
                    {t("createBooking")}
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                    >
                        {t("filters.all")}
                    </button>

                    <button
                        type="button"
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                        {t("filters.upcoming")}
                    </button>

                    <button
                        type="button"
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                        {t("filters.past")}
                    </button>
                </div>

                <input
                    type="search"
                    placeholder={t("search")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 sm:w-64"
                />
            </div>

            {/* Bookings table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t("table.customer")}
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t("table.event")}
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t("table.date")}
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t("table.status")}
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t("table.actions")}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-16 text-center"
                                >
                                    <p className="text-sm font-medium text-gray-900">
                                        {t("empty.title")}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {t("empty.description")}
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}