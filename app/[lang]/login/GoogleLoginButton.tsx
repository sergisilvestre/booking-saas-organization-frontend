"use client";

import { apiUrl } from "@/lib/api";

type Props = {
    lang: string;
    label: string;
};

export default function GoogleLoginButton({
    lang,
    label,
}: Props) {
    function handleGoogleLogin() {
        const url = new URL(
            apiUrl("auth/google/redirect"),
        );

        url.searchParams.set("locale", lang);

        window.location.href = url.toString();
    }

    return (
        <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    fill="#4285F4"
                    d="M21.35 12.27c0-.71-.06-1.4-.18-2.05H12v3.88h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.19Z"
                />
                <path
                    fill="#34A853"
                    d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.51A9.74 9.74 0 0 0 12 21.5Z"
                />
                <path
                    fill="#FBBC05"
                    d="M6.53 13.6A5.86 5.86 0 0 1 6.22 12c0-.56.1-1.1.31-1.6V7.89H3.28A9.5 9.5 0 0 0 2.25 12c0 1.53.37 2.98 1.03 4.11l3.25-2.51Z"
                />
                <path
                    fill="#EA4335"
                    d="M12 6.38c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.45 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.72 5.39l3.25 2.51c.77-2.31 2.93-4.02 5.47-4.02Z"
                />
            </svg>

            {label}
        </button>
    );
}