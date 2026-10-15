
import { getTranslations } from "next-intl/server";
import CreateEventTypeButton from "../../../../components/dashboard/event-types/CreateEventTypeButton";

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
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        {t("title")}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {t("subtitle")}
                    </p>
                </div>

                <CreateEventTypeButton />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-full rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                    <p className="text-sm font-medium text-gray-900">
                        {t("empty.title")}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        {t("empty.description")}
                    </p>

                    <div className="mt-5">
                        <CreateEventTypeButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
