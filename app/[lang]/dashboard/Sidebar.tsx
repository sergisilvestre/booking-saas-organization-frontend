import Link from "next/link";
import { getTranslations } from "next-intl/server";
import SidebarAccount from "@/app/[lang]/dashboard/SidebarAccount";

type Props = {
    lang: string;
};

export default async function Sidebar({ lang }: Props) {
    const t = await getTranslations({
        locale: lang,
        namespace: "dashboard.sidebar",
    });

    const navigation = [
        {
            key: "dashboard",
            href: `/${lang}/dashboard`,
        },
        {
            key: "calendar",
            href: `/${lang}/dashboard/calendar`,
        },
        {
            key: "bookings",
            href: `/${lang}/dashboard/bookings`,
        },
        {
            key: "eventTypes",
            href: `/${lang}/dashboard/event-types`,
        },
        {
            key: "availability",
            href: `/${lang}/dashboard/availability`,
        },
        {
            key: "customers",
            href: `/${lang}/dashboard/customers`,
        },
        {
            key: "settings",
            href: `/${lang}/dashboard/settings`,
        },
    ];

    return (
        <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-gray-200 bg-white">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
                <Link
                    href={`/${lang}/dashboard`}
                    className="text-xl font-bold tracking-tight text-gray-900"
                >
                    Booking
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => (
                    <Link
                        key={item.key}
                        href={item.href}
                        className="block rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        {t(item.key)}
                    </Link>
                ))}
            </nav>

            {/* User */}
            <SidebarAccount lang={lang} />
        </aside>
    );
}