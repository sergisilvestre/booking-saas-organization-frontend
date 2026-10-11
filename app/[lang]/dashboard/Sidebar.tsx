"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
    CalendarDays,
    CalendarClock,
    CreditCard,
    LayoutDashboard,
    Users,
    Settings,
    Tags,
    Wallet,
    Clock,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getOnboardingStatus } from "@/lib/onboarding";
import SidebarAccount from "@/app/[lang]/dashboard/SidebarAccount";

type Props = {
    lang: string;
};

const navigationIcons = {
    availability: Clock,
    billing: Wallet,
    bookings: CalendarClock,
    calendar: CalendarDays,
    customers: Users,
    dashboard: LayoutDashboard,
    eventTypes: Tags,
    settings: Settings,
    subscription: CreditCard,
};

export default function Sidebar({ lang: initialLang }: Props) {
    const params = useParams<{ lang: string }>();
    const pathname = usePathname();
    const t = useTranslations("dashboard.sidebar");

    // Always use the locale from the current URL.
    const lang = params.lang || initialLang;

    const { user, loadingUser } = useCurrentUser();

    const {
        emailNeedsValidation,
        organizationNeedsValidation,
    } = getOnboardingStatus(user);

    const navigation = [
        { key: "availability", href: `/${lang}/dashboard/availability` },
        { key: "billing", href: `/${lang}/dashboard/billing` },
        { key: "bookings", href: `/${lang}/dashboard/bookings` },
        { key: "calendar", href: `/${lang}/dashboard/calendar` },
        { key: "customers", href: `/${lang}/dashboard/customers` },
        { key: "dashboard", href: `/${lang}/dashboard` },
        { key: "eventTypes", href: `/${lang}/dashboard/event-types` },
        { key: "settings", href: `/${lang}/dashboard/settings` },
        { key: "subscription", href: `/${lang}/dashboard/subscription` },
    ].sort((a, b) =>
        t(a.key).localeCompare(t(b.key), lang, {
            sensitivity: "base",
        }),
    );

    const onboardingIncomplete =
        loadingUser ||
        emailNeedsValidation ||
        organizationNeedsValidation;

    return (
        <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-6">
                <Link
                    href={`/${lang}/dashboard`}
                    className="text-xl font-bold text-gray-900"
                >
                    Booking
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                    {navigation.map((item) => {
                        const Icon =
                            navigationIcons[
                            item.key as keyof typeof navigationIcons
                            ];

                        const isSettings = item.key === "settings";
                        const isDisabled =
                            onboardingIncomplete && !isSettings;

                        const isActive =
                            pathname === item.href ||
                            (item.key !== "dashboard" &&
                                pathname.startsWith(`${item.href}/`));

                        return (
                            <li key={item.key}>
                                <Link
                                    href={item.href}
                                    aria-disabled={isDisabled}
                                    tabIndex={isDisabled ? -1 : undefined}
                                    onClick={(event) => {
                                        if (isDisabled) {
                                            event.preventDefault();
                                        }
                                    }}
                                    className={[
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                        isDisabled
                                            ? "cursor-not-allowed opacity-40"
                                            : isActive
                                                ? "bg-gray-100 font-medium text-gray-900"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                    ].join(" ")}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <span>{t(item.key)}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="border-t border-gray-200 p-4">
                <SidebarAccount lang={lang} />
            </div>
        </aside>
    );
}