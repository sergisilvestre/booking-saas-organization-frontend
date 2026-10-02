"use client";

type Props = {
    accountNeedsValidation: boolean;
    paidBookingsNeedActivation: boolean;
};

export default function SettingsWarnings({
    accountNeedsValidation,
    paidBookingsNeedActivation,
}: Props) {
    if (!accountNeedsValidation && !paidBookingsNeedActivation) {
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

            {paidBookingsNeedActivation && (
                <a
                    href="https://connect.stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 transition-colors hover:bg-blue-100"
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
                                Click here to open Stripe →
                            </p>
                        </div>
                    </div>
                </a>
            )}
        </div>
    );
}