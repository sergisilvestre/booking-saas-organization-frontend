"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Props = {
    accountNeedsValidation: boolean;
    paidBookingsNeedActivation: boolean;
};

type StoredUser = {
    onboarding?: {
        status?: string;
    };
};

const USER_STORAGE_KEY = "user";

export default function SettingsWarnings({
    accountNeedsValidation,
    paidBookingsNeedActivation,
}: Props) {
    const [onboardingNeedsValidation, setOnboardingNeedsValidation] =
        useState(accountNeedsValidation);

    const [stripeOnboardingUrl, setStripeOnboardingUrl] = useState<
        string | null
    >(null);

    const [loadingStripe, setLoadingStripe] = useState(false);

    useEffect(() => {
        const loadOnboardingStatus = async () => {
            try {
                const response = await apiFetch(
                    "organization/auth/me"
                );

                if (!response.ok) {
                    setOnboardingNeedsValidation(
                        accountNeedsValidation
                    );
                    return;
                }

                const data = await response.json();
                const user: StoredUser = data.data ?? data;

                localStorage.setItem(
                    USER_STORAGE_KEY,
                    JSON.stringify(user)
                );

                setOnboardingNeedsValidation(
                    user.onboarding?.status !== "complete"
                );
            } catch (error) {
                console.error(
                    "Unable to load onboarding status:",
                    error
                );

                setOnboardingNeedsValidation(
                    accountNeedsValidation
                );
            }
        };

        loadOnboardingStatus();

        window.addEventListener(
            "organization-registered",
            loadOnboardingStatus
        );

        return () => {
            window.removeEventListener(
                "organization-registered",
                loadOnboardingStatus
            );
        };
    }, [accountNeedsValidation]);

    useEffect(() => {
        if (
            !paidBookingsNeedActivation ||
            onboardingNeedsValidation
        ) {
            return;
        }

        const loadStripeOnboardingUrl = async () => {
            try {
                setLoadingStripe(true);
                setStripeOnboardingUrl(null);

                const response = await apiFetch(
                    "organization/onboarding/form-data"
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
                console.error(
                    "Stripe onboarding error:",
                    error
                );
            } finally {
                setLoadingStripe(false);
            }
        };

        loadStripeOnboardingUrl();
    }, [
        onboardingNeedsValidation,
        paidBookingsNeedActivation,
    ]);

    if (
        !onboardingNeedsValidation &&
        !paidBookingsNeedActivation
    ) {
        return null;
    }

    return (
        <div className="mb-6 space-y-3">
            {onboardingNeedsValidation && (
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
                                Complete your account information to
                                unlock all features.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {paidBookingsNeedActivation &&
                !onboardingNeedsValidation && (
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
                                            Connect Stripe to start
                                            accepting paid bookings.
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
                                        Connect Stripe to start
                                        accepting paid bookings.
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