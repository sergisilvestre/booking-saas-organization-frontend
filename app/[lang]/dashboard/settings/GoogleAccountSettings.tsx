
"use client";

import { useState } from "react";

type Props = {
    translations: {
        title: string;
        description: string;
        connect: string;
        connecting: string;
    };
};


export default function GoogleAccountSettings({
    translations: t,
}: Props) {
    const [connecting, setConnecting] = useState(false);

    const handleConnect = () => {
        if (connecting) {
            return;
        }

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(
            /\/$/,
            "",
        );

        if (!apiBaseUrl) {
            console.error("NEXT_PUBLIC_API_URL is not configured.");
            return;
        }

        setConnecting(true);

        window.location.href =
            `${apiBaseUrl}/auth/google/redirect?intent=connect`;
    };

    

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h3 className="text-base font-semibold text-gray-900">
                    {t.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    {t.description}
                </p>
            </div>

            <button
                type="button"
                onClick={handleConnect}
                disabled={connecting}
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <svg
                    aria-hidden="true"
                    viewBox="0 0 48 48"
                    className="h-5 w-5"
                >
                    <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.02 13.22l7.98 6.19C11.9 13.72 17.5 9.5 24 9.5Z"
                    />
                    <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.65 5.94c4.47-4.13 7.12-10.2 7.12-17.59Z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M9.99 28.59A14.4 14.4 0 0 1 9.2 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.57 10.78l7.42-6.19Z"
                    />
                    <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.91-5.86l-7.65-5.94c-2.13 1.43-4.86 2.28-8.26 2.28-6.5 0-12.1-4.22-14-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                    />
                </svg>

                {connecting ? t.connecting : t.connect}
            </button>
        </section>
    );
}
