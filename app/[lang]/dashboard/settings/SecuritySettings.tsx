"use client";

type Props = {
    translations: {
        title: string;
        description: string;
        changePassword: string;
    };
};

export default function SecuritySettings({
    translations: t,
}: Props) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900">
                    {t.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    {t.description}
                </p>
            </div>

            <button
                type="button"
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
                {t.changePassword}
            </button>
        </section>
    );
}