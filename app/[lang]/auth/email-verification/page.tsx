"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";

export default function EmailVerificationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams<{ lang: string }>();
    const t = useTranslations("emailVerification");

    const hasFetched = useRef(false);

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token || hasFetched.current) {
            return;
        }

        hasFetched.current = true;

        const verifyEmail = async () => {
            try {
                const response = await apiFetch(
                    "organization/onboarding/verify-email",
                    {
                        method: "POST",
                        auth: true,
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            token,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to verify email"
                    );
                }

                router.replace(
                    `/${params.lang}/login?email_verified=true`
                );
            } catch (error) {
                console.error(
                    "Email verification error:",
                    error
                );

                router.replace(
                    `/${params.lang}/login?error=email_verification_failed`
                );
            }
        };

        verifyEmail();
    }, [params.lang, router, searchParams]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                    </div>

                    <h1 className="mt-6 text-xl font-semibold tracking-tight text-gray-900">
                        {t("title")}
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {t("description")}
                    </p>
                </div>

                <p className="mt-6 text-center text-xs text-gray-400">
                    {t("secureVerification")}
                </p>
            </div>
        </main>
    );
}