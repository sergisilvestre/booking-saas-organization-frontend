"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

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
        let mounted = true;

        async function checkAuth() {
            const token = localStorage.getItem("token");

            if (!token) {
                if (mounted) {
                    setChecking(false);
                }

                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiUrl) {
                localStorage.removeItem("token");

                if (mounted) {
                    setChecking(false);
                }

                return;
            }

            try {
                const response = await fetch(`${apiUrl}/api/auth/me`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    router.replace(`/${lang}/dashboard`);
                    return;
                }

                if (response.status === 401) {
                    localStorage.removeItem("token");
                }

                if (mounted) {
                    setChecking(false);
                }
            } catch {
                /*
                 * No eliminamos el token ante un error de red.
                 */
                if (mounted) {
                    setChecking(false);
                }
            }
        }

        checkAuth();

        return () => {
            mounted = false;
        };
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