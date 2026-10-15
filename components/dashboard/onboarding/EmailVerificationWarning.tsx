"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
    email?: string;
};

export default function EmailVerificationWarning({ email }: Props) {
    const t = useTranslations("dashboard.settings.warnings");

    const [showDialog, setShowDialog] = useState(false);

    return (
        <>
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

                        <button
                            type="button"
                            onClick={() => setShowDialog(true)}
                            className="mt-3 text-sm font-semibold text-amber-900 underline"
                        >
                            {t("account.resend")}
                        </button>
                    </div>
                </div>
            </div>

            {showDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="email-verification-title"
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                    >
                        <h2
                            id="email-verification-title"
                            className="text-lg font-semibold text-gray-900"
                        >
                            {t("email.dialog.title")}
                        </h2>

                        <p className="mt-2 text-sm text-gray-600">
                            {t("email.dialog.description")}
                        </p>

                        <p className="mt-2 text-sm font-medium text-gray-900">
                            {email}
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDialog(false)}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                {t("email.dialog.close")}
                            </button>

                            <button
                                type="button"
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                            >
                                {t("email.dialog.resend")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}