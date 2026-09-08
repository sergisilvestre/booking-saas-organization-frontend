"use client";

import {
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import TimezoneField from "@/components/TimezoneField";

type Props = {
    lang: string;
};

export default function RegisterForm({ lang }: Props) {
    const t = useTranslations("register");
    const router = useRouter();

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const [form, setForm] = useState({
        name: "",
        email: "",
        organization: "",
        password: "",
        passwordConfirmation: "",
        timezone: timezone,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [checkingOrganization, setCheckingOrganization] = useState(false);
    const [organizationExists, setOrganizationExists] = useState<
        boolean | null
    >(null);

    /*
     * Check organization availability
     */
    useEffect(() => {
        const organization = form.organization.trim();

        const slug = organization
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        if (!slug) {
            setOrganizationExists(null);
            setCheckingOrganization(false);
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setOrganizationExists(null);
            setCheckingOrganization(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setCheckingOrganization(true);
                setOrganizationExists(null);

                const response = await fetch(
                    `${apiUrl}/api/public/organizations/check-slug?slug=${encodeURIComponent(
                        slug
                    )}`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to check organization");
                }

                const data: { exists: boolean } = await response.json();

                setOrganizationExists(data.exists);
            } catch {
                setOrganizationExists(null);
            } finally {
                setCheckingOrganization(false);
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [form.organization]);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function handleTimezoneChange(timezone: string) {
        setForm((previous) => ({
            ...previous,
            timezone,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");

        if (form.password !== form.passwordConfirmation) {
            setError(t("errors.passwordMismatch"));
            return;
        }

        if (organizationExists === true) {
            setError(t("errors.organizationExists"));
            return;
        }

        if (organizationExists === null) {
            setError(t("form.organization.checkError"));
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError(t("errors.apiNotConfigured"));
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${apiUrl}/api/organization/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    organization_name: form.organization,
                    organization_slug: form.organization,
                    password: form.password,
                    password_confirmation: form.passwordConfirmation,
                    organization_timezone: form.timezone,
                    locale: lang,
                }),
            });

            const contentType = response.headers.get("content-type");

            const data = contentType?.includes("application/json")
                ? await response.json()
                : null;

            if (!response.ok) {
                throw new Error(
                    data?.message || t("errors.default")
                );
            }

            if (data?.token) {
                localStorage.setItem("token", data.token);
            }

            router.push(`/${lang}/login`);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(t("errors.default"));
            }
        } finally {
            setLoading(false);
        }
    }

    const organizationHasValue =
        form.organization.trim().length > 0;

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
        >
            {/* Name */}
            <div>
                <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
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
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
            </div>

            {/* Email */}
            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
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
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
            </div>

            {/* Organization */}
            <div>
                <label
                    htmlFor="organization"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    {t("form.organization.label")}
                </label>

                <input
                    id="organization"
                    name="organization"
                    type="text"
                    value={form.organization}
                    onChange={handleChange}
                    placeholder={t("form.organization.placeholder")}
                    required
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-1 ${organizationExists === true
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : organizationExists === false
                            ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                            : "border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                        }`}
                />

                {checkingOrganization && (
                    <p className="mt-2 text-xs text-gray-400">
                        {t("form.organization.checking")}
                    </p>
                )}

                {!checkingOrganization &&
                    organizationHasValue &&
                    organizationExists === true && (
                        <p className="mt-2 text-xs text-red-600">
                            {t("form.organization.exists")}
                        </p>
                    )}

                {!checkingOrganization &&
                    organizationHasValue &&
                    organizationExists === false && (
                        <p className="mt-2 text-xs text-green-600">
                            {t("form.organization.available")}
                        </p>
                    )}
            </div>

            {/* Password */}
            <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
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
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />

                <p className="mt-2 text-xs text-gray-400">
                    {t("form.password.hint")}
                </p>
            </div>

            {/* Password confirmation */}
            <div>
                <label
                    htmlFor="passwordConfirmation"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    {t("form.passwordConfirmation.label")}
                </label>

                <input
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type="password"
                    autoComplete="new-password"
                    value={form.passwordConfirmation}
                    onChange={handleChange}
                    placeholder={t(
                        "form.passwordConfirmation.placeholder"
                    )}
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
            </div>

            {/* Error */}
            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                    {error}
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={
                    loading ||
                    checkingOrganization ||
                    organizationExists === true ||
                    !form.timezone
                }
                className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading
                    ? t("submit.loading")
                    : t("submit.default")}
            </button>
        </form>
    );
}