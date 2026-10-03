"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function GoogleCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams<{ lang: string }>();

    const hasFetched = useRef(false);

    useEffect(() => {
        const code = searchParams.get("code");

        if (!code || hasFetched.current) {
            return;
        }

        hasFetched.current = true;

        const exchangeLoginCode = async () => {
            try {
                const response = await apiFetch(
                    "auth/exchange-login-code",
                    {
                        method: "POST",
                        auth: false,
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            code,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to exchange login code");
                }

                const data: { token: string } = await response.json();

                localStorage.setItem("token", data.token);

                router.replace(`/${params.lang}/dashboard`);
            } catch (error) {
                console.error("Google authentication error:", error);

                router.replace(
                    `/${params.lang}/login?error=google_auth_failed`
                );
            }
        };

        exchangeLoginCode();
    }, [params.lang, router, searchParams]);

    return (
        <main>
            <p>Signing you in...</p>
        </main>
    );
}