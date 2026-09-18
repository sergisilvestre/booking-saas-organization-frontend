"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

type Props = {
    lang: string;
};

export default function RegisterForm({ lang }: Props) {
    const t = useTranslations("register");
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        passwordConfirmation: "",
    });

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function handleGoogleRegister() {
        setError("");

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError(t("errors.apiNotConfigured"));
            return;
        }

        setGoogleLoading(true);

        window.location.assign(
            `${apiUrl}/api/organization/auth/google/redirect?locale=${encodeURIComponent(lang)}`
        );
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (form.password !== form.passwordConfirmation) {
            setError(t("errors.passwordMismatch"));
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError(t("errors.apiNotConfigured"));
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    password_confirmation: form.passwordConfirmation,
                    locale: lang,
                }),
            });

            const data = response.headers
                .get("content-type")
                ?.includes("application/json")
                ? await response.json()
                : null;

            if (!response.ok) {
                throw new Error(data?.message || t("errors.default"));
            }

            localStorage.setItem("token", data.token);

            // Organization creation happens after account registration.
            router.push(`/${lang}/profile/organization`);
        } catch (err) {
            setError(err instanceof Error ? err.message : t("errors.default"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={googleLoading || loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.5a4.7 4.7 0 0 1-2 3.1v2.3h3.2c1.9-1.8 3.1-4.3 3.1-7.1Z" />
                    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.5l-3.2-2.3c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H2.9v2.4A10 10 0 0 0 12 22Z" />
                    <path fill="#FBBC05" d="M6.2 13.8a6 6 0 0 1 0-3.7V7.7H2.9a10 10 0 0 0 0 8.6l3.3-2.5Z" />
                    <path fill="#EA4335" d="M12 5.9c1.5 0 2.9.5 3.9 1.5l2.9-2.9C17 2.8 14.7 2 12 2a10 10 0 0 0-9.1 5.7l3.3 2.4C7 7.7 9.3 5.9 12 5.9Z" />
                </svg>

                {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                    {t("form.name.label")}
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t("form.name.placeholder")}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
            </div>

            <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                    {t("form.email.label")}
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t("form.email.placeholder")}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
            </div>

            <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                    {t("form.password.label")}
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={t("form.password.placeholder")}
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
            </div>

            <div>
                <label htmlFor="passwordConfirmation" className="mb-2 block text-sm font-medium text-gray-700">
                    {t("form.passwordConfirmation.label")}
                </label>
                <input
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type="password"
                    autoComplete="new-password"
                    value={form.passwordConfirmation}
                    onChange={handleChange}
                    placeholder={t("form.passwordConfirmation.placeholder")}
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
            </div>

            {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? t("submit.loading") : t("submit.default")}
            </button>
        </form>
    );
}