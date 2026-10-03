"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Props = {
    accountNeedsValidation: boolean;
    paidBookingsNeedActivation: boolean;
};

export default function SettingsWarnings({
    accountNeedsValidation,
    paidBookingsNeedActivation,
}: Props) {
    const [stripeOnboardingUrl, setStripeOnboardingUrl] = useState<string | null>(
        null
    );
    const [loadingStripe, setLoadingStripe] = useState(false);

    useEffect(() => {
        if (
            !paidBookingsNeedActivation ||
            accountNeedsValidation
        ) {
            return;
        }

        const loadStripeOnboardingUrl = async () => {
            try {
                setLoadingStripe(true);

                const response = await apiFetch(
                    "organization/onboarding"
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Unable to start Stripe onboarding."
                    );
                }

                if (!data.url) {
                    throw new Error(
                        "Stripe onboarding URL was not returned."
                    );
                }

                setStripeOnboardingUrl(data.url);
            } catch (error) {
                console.error("Stripe onboarding error:", error);
            } finally {
                setLoadingStripe(false);
            }
        };

        loadStripeOnboardingUrl();
    }, [accountNeedsValidation, paidBookingsNeedActivation]);

    if (
        !accountNeedsValidation &&
        !paidBookingsNeedActivation
    ) {
        return null;
    }

    return (
        <div className="mb-6 space-y-3">
            {accountNeedsValidation && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 font-bold text-amber-600">
                            !
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-amber-900">
                                Validate your account
                            </p>

                            <p className="mt-1 text-sm text-amber-800">
                                Complete your account information to unlock
                                all features.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {paidBookingsNeedActivation && !accountNeedsValidation && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                    {stripeOnboardingUrl ? (
                        <a
                            href={stripeOnboardingUrl}
                            className="block w-full cursor-pointer text-left"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 font-bold text-blue-600">
                                    !
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-blue-900">
                                        Activate paid bookings
                                    </p>

                                    <p className="mt-1 text-sm text-blue-800">
                                        Connect Stripe to start accepting paid
                                        bookings.
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-blue-900">
                                        Click here to continue →
                                    </p>
                                </div>
                            </div>
                        </a>
                    ) : (
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 font-bold text-blue-600">
                                !
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-blue-900">
                                    Activate paid bookings
                                </p>

                                <p className="mt-1 text-sm text-blue-800">
                                    Connect Stripe to start accepting paid
                                    bookings.
                                </p>

                                {loadingStripe && (
                                    <p className="mt-2 text-sm font-semibold text-blue-900">
                                        Preparing Stripe...
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}