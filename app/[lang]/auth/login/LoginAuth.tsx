"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Props = {
    lang: string;
    children: ReactNode;
};

export default function LoginAuth({
    lang,
    children,
}: Props) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem("token");

            if (!token) {
                setChecking(false);
                return;
            }

            try {
                const response = await apiFetch(
                    "organization/auth/me",
                );

                if (response.ok) {
                    router.replace(`/${lang}/dashboard`);
                    return;
                }

                if (response.status === 401) {
                    localStorage.removeItem("token");
                }

                setChecking(false);
            } catch {
                /*
                 * Do not remove the token on network errors.
                 */
                setChecking(false);
            }
        }

        checkAuth();
    }, [lang, router]);

    if (checking) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            </main>
        );
    }

    return children;
}