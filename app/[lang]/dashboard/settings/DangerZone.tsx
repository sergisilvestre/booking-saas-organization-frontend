"use client";

type Props = {
    translations: {
        title: string;
        description: string;
        delete: string;
    };
};

export default function DangerZone({
    translations: t,
}: Props) {
    return (
        <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-base font-semibold text-red-600">
                    {t.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    {t.description}
                </p>
            </div>

            <button
                type="button"
                className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
                {t.delete}
            </button>
        </section>
    );
}