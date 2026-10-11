"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createStripeOnboardingSession } from "@/services/stripe-onboarding";

export default function StripeWarning() {
    const t = useTranslations("dashboard.settings.warnings");
    const [loadingStripe, setLoadingStripe] = useState(false);

    const handleStripeOnboarding = async () => {
        if (loadingStripe) {
            return;
        }

        try {
            setLoadingStripe(true);

            const url = await createStripeOnboardingSession();

            window.location.assign(url);
        } catch (error) {
            console.error("Stripe onboarding error:", error);
            setLoadingStripe(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleStripeOnboarding}
            disabled={loadingStripe}
            className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left transition hover:bg-blue-100 disabled:cursor-wait disabled:opacity-70"
        >
            <div className="flex items-start gap-3">
                <div className="mt-0.5 font-bold text-blue-600">
                    !
                </div>

                <div>
                    <p className="text-sm font-semibold text-blue-900">
                        {t("stripe.title")}
                    </p>

                    <p className="mt-1 text-sm text-blue-800">
                        {t("stripe.description")}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-blue-900">
                        {loadingStripe
                            ? t("stripe.loading")
                            : `${t("stripe.action")} →`}
                    </p>
                </div>
            </div>
        </button>
    );
}
