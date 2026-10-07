"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";

type StoredUser = {
    role?: string;
    onboarding?: {
        status?: string;
    };
    organization?: {
        name?: string;
        slug?: string;
    };
    features?: {
        payments?: boolean;
    };
};

const USER_STORAGE_KEY = "user";

export default function SettingsWarnings() {
    const t = useTranslations("dashboard.settings.warnings");

    const [user, setUser] = useState<StoredUser | null>(null);

    const [stripeOnboardingUrl, setStripeOnboardingUrl] = useState<
        string | null
    >(null);

    const [loadingStripe, setLoadingStripe] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await apiFetch("organization/auth/me");

                if (response.ok) {
                    const data = await response.json();
                    const currentUser: StoredUser = data.data ?? data;

                    localStorage.setItem(
                        USER_STORAGE_KEY,
                        JSON.stringify(currentUser)
                    );

                    setUser(currentUser);

                    return;
                }

                const storedUser = localStorage.getItem(
                    USER_STORAGE_KEY
                );

                if (!storedUser) {
                    setUser(null);
                    return;
                }

                try {
                    const currentUser: StoredUser =
                        JSON.parse(storedUser);

                    setUser(currentUser);
                } catch {
                    setUser(null);
                }
            } catch (error) {
                console.error("Unable to load user:", error);

                const storedUser = localStorage.getItem(
                    USER_STORAGE_KEY
                );

                if (!storedUser) {
                    setUser(null);
                    return;
                }

                try {
                    const currentUser: StoredUser =
                        JSON.parse(storedUser);

                    setUser(currentUser);
                } catch {
                    setUser(null);
                }
            }
        };

        loadUser();

        window.addEventListener(
            "organization-registered",
            loadUser
        );

        return () => {
            window.removeEventListener(
                "organization-registered",
                loadUser
            );
        };
    }, []);

    const onboardingNeedsValidation =
        user?.onboarding !== undefined &&
        user.onboarding.status !== "complete";

    const showStripeWarning =
        user?.role === "owner" &&
        user.organization !== undefined &&
        user.onboarding?.status === "complete" &&
        user.features?.payments !== true;

    useEffect(() => {
        if (!showStripeWarning) {
            setStripeOnboardingUrl(null);
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
    }, [showStripeWarning]);

    if (!onboardingNeedsValidation && !showStripeWarning) {
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
                                {t("account.title")}
                            </p>

                            <p className="mt-1 text-sm text-amber-800">
                                {t("account.description")}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showStripeWarning && (
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
                                        {t("stripe.title")}
                                    </p>

                                    <p className="mt-1 text-sm text-blue-800">
                                        {t("stripe.description")}
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-blue-900">
                                        {t("stripe.action")} →
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
                                    {t("stripe.title")}
                                </p>

                                <p className="mt-1 text-sm text-blue-800">
                                    {t("stripe.description")}
                                </p>

                                {loadingStripe && (
                                    <p className="mt-2 text-sm font-semibold text-blue-900">
                                        {t("stripe.loading")}
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