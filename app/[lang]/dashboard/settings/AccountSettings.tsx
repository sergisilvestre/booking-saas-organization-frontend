"use client";

type User = {
    id: string;
    name: string;
    email: string;
};

type Props = {
    translations: {
        title: string;
        description: string;
        name: string;
        namePlaceholder: string;
        email: string;
        emailPlaceholder: string;
        save: string;
    };
    user: User | null;
};

export default function AccountSettings({
    translations: t,
    user,
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

            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label
                        htmlFor="account-name"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        {t.name}
                    </label>

                    <input
                        id="account-name"
                        name="account_name"
                        type="text"
                        value={user?.name ?? ""}
                        disabled
                        placeholder={t.namePlaceholder}
                        autoComplete="off"
                        className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none disabled:cursor-not-allowed"
                    />
                </div>

                <div>
                    <label
                        htmlFor="account-email"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        {t.email}
                    </label>

                    <input
                        id="account-email"
                        name="account_email"
                        type="email"
                        value={user?.email ?? ""}
                        disabled
                        placeholder={t.emailPlaceholder}
                        autoComplete="off"
                        className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none disabled:cursor-not-allowed"
                    />
                </div>
            </div>
        </section>
    );
}