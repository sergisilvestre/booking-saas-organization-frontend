'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function GoogleCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams<{ lang: string }>();

    // Cerrojo para evitar que se ejecute dos veces en React Strict Mode
    const hasFetched = useRef(false);

    useEffect(() => {
        const code = searchParams.get('code');

        // Si no hay código o ya se intentó canjear, salimos inmediatamente
        if (!code || hasFetched.current) return;

        hasFetched.current = true; // Bloqueamos para futuros reintentos en este montaje

        const exchangeLoginCode = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/exchange-login-code`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            code,
                        }),
                    },
                );

                if (!response.ok) {
                    throw new Error('Failed to exchange login code');
                }

                const data: { token: string } = await response.json();

                localStorage.setItem('token', data.token);

                // Descomenta esto cuando quieras redirigir al dashboard
                router.replace(`/${params.lang}/dashboard`);
            } catch (error) {
                router.replace(
                    `/${params.lang}/login?error=google_auth_failed`,
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