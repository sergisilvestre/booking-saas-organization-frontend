"use client";

import { useEffect, useState } from "react";
import TimezoneField from "@/components/TimezoneField";

type Translations = {
    title: string;
    description: string;
    name: string;
    namePlaceholder: string;
    slug: string;
    slugPlaceholder: string;
    timezone: string;
    business: {
        title: string;
        description: string;
        legalName: string;
        legalNamePlaceholder: string;
        taxId: string;
        taxIdPlaceholder: string;
        businessType: string;
        phoneNumber: string;
        phoneNumberPlaceholder: string;
        types: {
            company: string;
            individual: string;
            nonProfit: string;
        };
    };
    save: string;
};

type Props = {
    translations: Translations;
};

type OrganizationSlugAvailability =
    | "idle"
    | "checking"
    | "available"
    | "unavailable";

const MIN_ORGANIZATION_NAME_LENGTH = 5;
const MIN_SLUG_LENGTH = 5;

export default function OrganizationSettings({
    translations: t,
}: Props) {
    const [timezone, setTimezone] = useState("Europe/Madrid");

    const [organizationName, setOrganizationName] = useState("");
    const [organizationSlug, setOrganizationSlug] = useState("");

    const [organizationSlugAvailability, setOrganizationSlugAvailability] =
        useState<OrganizationSlugAvailability>("idle");

    const [legalName, setLegalName] = useState("");
    const [taxId, setTaxId] = useState("");
    const [businessType, setBusinessType] = useState("company");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [saveError, setSaveError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>(
        {}
    );
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const slug = organizationSlug.trim();

        setSaveError(null);

        if (!slug || slug.length < MIN_SLUG_LENGTH) {
            setOrganizationSlugAvailability("idle");
            return;
        }

        const timeout = window.setTimeout(async () => {
            setOrganizationSlugAvailability("checking");

            try {
                const token = localStorage.getItem("token");

                const apiUrl = (
                    process.env.NEXT_PUBLIC_API_URL ?? ""
                ).replace(/\/$/, "");

                const url =
                    `${apiUrl}/api/organization/check-slug?slug=` +
                    encodeURIComponent(slug);

                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                });

                if (!response.ok) {
                    setOrganizationSlugAvailability("idle");
                    return;
                }

                const data = await response.json();

                setOrganizationSlugAvailability(
                    data.exists === false
                        ? "available"
                        : "unavailable"
                );
            } catch (error) {
                console.error(
                    "Organization slug availability check failed:",
                    error
                );

                setOrganizationSlugAvailability("idle");
            }
        }, 400);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [organizationSlug]);

    const clearFieldError = (field: string) => {
        setFieldErrors((current) => ({
            ...current,
            [field]: "",
        }));

        setSaveError(null);
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        const name = organizationName.trim();
        const slug = organizationSlug.trim();

        if (!name) {
            errors.name = "Organization name is required.";
        } else if (name.length < MIN_ORGANIZATION_NAME_LENGTH) {
            errors.name = `Organization name must be at least ${MIN_ORGANIZATION_NAME_LENGTH} characters.`;
        }

        if (!slug) {
            errors.slug = "Organization slug is required.";
        } else if (slug.length < MIN_SLUG_LENGTH) {
            errors.slug = `Organization slug must be at least ${MIN_SLUG_LENGTH} characters.`;
        } else if (organizationSlugAvailability === "unavailable") {
            errors.slug = "This organization slug is already taken.";
        } else if (organizationSlugAvailability !== "available") {
            errors.slug =
                "Please wait until the organization slug is available.";
        }

        if (!legalName.trim()) {
            errors.legal_name = "Legal name is required.";
        }

        if (!taxId.trim()) {
            errors.tax_id = "NIF / Tax ID is required.";
        }

        if (!businessType.trim()) {
            errors.business_type = "Business type is required.";
        }

        if (!phoneNumber.trim()) {
            errors.phone_number = "Phone number is required.";
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        setSaveError(null);

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);

        try {
            const token = localStorage.getItem("token");

            const apiUrl = (
                process.env.NEXT_PUBLIC_API_URL ?? ""
            ).replace(/\/$/, "");

            const response = await fetch(
                `${apiUrl}/api/organization/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                    body: JSON.stringify({
                        name: organizationName.trim(),
                        slug: organizationSlug.trim(),
                        timezone,
                        legal_name: legalName.trim(),
                        tax_id: taxId.trim(),
                        business_type: businessType,
                        phone_number: phoneNumber.trim(),
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                if (response.status === 422) {
                    const backendErrors =
                        data?.errors ?? data?.data?.errors ?? {};

                    setFieldErrors(backendErrors);

                    setSaveError(
                        data?.message ??
                        "Please check the form and try again."
                    );

                    return;
                }

                throw new Error(
                    data?.message ??
                    "Unable to save the organization."
                );
            }

            setFieldErrors({});
            setSaveError(null);
        } catch (error) {
            setSaveError(
                error instanceof Error
                    ? error.message
                    : "Unable to save the organization."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const inputClassName =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

    const selectClassName =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

    const errorClassName =
        "border-red-500 focus:border-red-500 focus:ring-red-500";

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900">
                    {t.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    {t.description}
                </p>
            </div>

            <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                    {/* Organization name */}
                    <div>
                        <label
                            htmlFor="organization-name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            {t.name}
                        </label>

                        <input
                            id="organization-name"
                            name="name"
                            type="text"
                            value={organizationName}
                            onChange={(event) => {
                                setOrganizationName(event.target.value);
                                clearFieldError("name");
                            }}
                            placeholder={t.namePlaceholder}
                            autoComplete="off"
                            className={`${inputClassName} ${fieldErrors.name
                                    ? errorClassName
                                    : ""
                                }`}
                        />

                        {fieldErrors.name && (
                            <p className="mt-2 text-sm text-red-600">
                                {fieldErrors.name}
                            </p>
                        )}
                    </div>

                    {/* Organization slug */}
                    <div>
                        <label
                            htmlFor="organization-slug"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            {t.slug}
                        </label>

                        <input
                            id="organization-slug"
                            name="slug"
                            type="text"
                            value={organizationSlug}
                            onChange={(event) => {
                                const value = event.target.value
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")
                                    .replace(/[^a-z0-9-]/g, "");

                                setOrganizationSlug(value);
                                clearFieldError("slug");
                            }}
                            placeholder={t.slugPlaceholder}
                            autoComplete="off"
                            className={`${inputClassName} ${fieldErrors.slug
                                    ? errorClassName
                                    : ""
                                }`}
                        />

                        {organizationSlug.trim().length > 0 &&
                            organizationSlug.trim().length <
                            MIN_SLUG_LENGTH && (
                                <p className="mt-2 text-sm text-red-600">
                                    Organization slug must be at least{" "}
                                    {MIN_SLUG_LENGTH} characters.
                                </p>
                            )}

                        {organizationSlug.trim().length >=
                            MIN_SLUG_LENGTH && (
                                <div className="mt-2 text-sm">
                                    {organizationSlugAvailability ===
                                        "checking" && (
                                            <span className="text-gray-500">
                                                Checking availability...
                                            </span>
                                        )}

                                    {organizationSlugAvailability ===
                                        "available" && (
                                            <span className="text-green-600">
                                                Organization slug is available.
                                            </span>
                                        )}

                                    {organizationSlugAvailability ===
                                        "unavailable" && (
                                            <span className="text-red-600">
                                                Organization slug is already taken.
                                            </span>
                                        )}
                                </div>
                            )}

                        {fieldErrors.slug && (
                            <p className="mt-2 text-sm text-red-600">
                                {fieldErrors.slug}
                            </p>
                        )}
                    </div>
                </div>

                <TimezoneField
                    id="organization-timezone"
                    value={timezone}
                    onChange={setTimezone}
                    label={t.timezone}
                />

                {/* Business details */}
                <div className="border-t border-gray-100 pt-6">
                    <div className="mb-5">
                        <h4 className="text-sm font-semibold text-gray-900">
                            {t.business.title}
                        </h4>

                        <p className="mt-1 text-sm text-gray-500">
                            {t.business.description}
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {/* Legal name */}
                        <div>
                            <label
                                htmlFor="legal-name"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                {t.business.legalName}
                            </label>

                            <input
                                id="legal-name"
                                name="legal_name"
                                type="text"
                                value={legalName}
                                onChange={(event) => {
                                    setLegalName(event.target.value);
                                    clearFieldError("legal_name");
                                }}
                                placeholder={
                                    t.business.legalNamePlaceholder
                                }
                                autoComplete="off"
                                className={`${inputClassName} ${fieldErrors.legal_name
                                        ? errorClassName
                                        : ""
                                    }`}
                            />

                            {fieldErrors.legal_name && (
                                <p className="mt-2 text-sm text-red-600">
                                    {fieldErrors.legal_name}
                                </p>
                            )}
                        </div>

                        {/* Tax ID */}
                        <div>
                            <label
                                htmlFor="tax-id"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                {t.business.taxId}
                            </label>

                            <input
                                id="tax-id"
                                name="tax_id"
                                type="text"
                                value={taxId}
                                onChange={(event) => {
                                    setTaxId(event.target.value);
                                    clearFieldError("tax_id");
                                }}
                                placeholder={
                                    t.business.taxIdPlaceholder
                                }
                                autoComplete="off"
                                className={`${inputClassName} ${fieldErrors.tax_id
                                        ? errorClassName
                                        : ""
                                    }`}
                            />

                            {fieldErrors.tax_id && (
                                <p className="mt-2 text-sm text-red-600">
                                    {fieldErrors.tax_id}
                                </p>
                            )}
                        </div>

                        {/* Business type */}
                        <div>
                            <label
                                htmlFor="business-type"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                {t.business.businessType}
                            </label>

                            <select
                                id="business-type"
                                name="business_type"
                                value={businessType}
                                onChange={(event) => {
                                    setBusinessType(event.target.value);
                                    clearFieldError("business_type");
                                }}
                                className={`${selectClassName} ${fieldErrors.business_type
                                        ? errorClassName
                                        : ""
                                    }`}
                            >
                                <option value="company">
                                    {t.business.types.company}
                                </option>

                                <option value="individual">
                                    {t.business.types.individual}
                                </option>

                                <option value="non_profit">
                                    {t.business.types.nonProfit}
                                </option>
                            </select>

                            {fieldErrors.business_type && (
                                <p className="mt-2 text-sm text-red-600">
                                    {fieldErrors.business_type}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label
                                htmlFor="phone-number"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                {t.business.phoneNumber}
                            </label>

                            <input
                                id="phone-number"
                                name="phone_number"
                                type="tel"
                                value={phoneNumber}
                                onChange={(event) => {
                                    setPhoneNumber(event.target.value);
                                    clearFieldError("phone_number");
                                }}
                                placeholder={
                                    t.business.phoneNumberPlaceholder
                                }
                                autoComplete="off"
                                className={`${inputClassName} ${fieldErrors.phone_number
                                        ? errorClassName
                                        : ""
                                    }`}
                            />

                            {fieldErrors.phone_number && (
                                <p className="mt-2 text-sm text-red-600">
                                    {fieldErrors.phone_number}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {saveError && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {saveError}
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSaving
                        ? "Saving..."
                        : t.save}
                </button>
            </div>
        </section>
    );
}