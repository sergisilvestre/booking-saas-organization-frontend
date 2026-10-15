"use client";

import { useTranslations } from "next-intl";

export default function OrganizationWarning() {
    const t = useTranslations("dashboard.settings.warnings");

    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 font-bold text-amber-600">
                    !
                </div>

                <div>
                    <p className="text-sm font-semibold text-amber-900">
                        {t("organization.title")}
                    </p>

                    <p className="mt-1 text-sm text-amber-800">
                        {t("organization.description")}
                    </p>
                </div>
            </div>
        </div>
    );
}