"use client";

import { useEffect, useState } from "react";

import TimezoneField from "@/components/TimezoneField";
import { apiFetch } from "@/lib/api";

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
const MAX_ORGANIZATION_NAME_LENGTH = 100;

const MIN_SLUG_LENGTH = 5;
const MAX_SLUG_LENGTH = 50;

const MIN_LEGAL_NAME_LENGTH = 2;
const MAX_LEGAL_NAME_LENGTH = 150;

const MIN_TAX_ID_LENGTH = 8;
const MAX_TAX_ID_LENGTH = 20;

const MIN_PHONE_LENGTH = 9;
const MAX_PHONE_LENGTH = 20;

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const DNI_REGEX = /^\d{8}[A-Z]$/;
const NIE_REGEX = /^[XYZ]\d{7}[A-Z]$/;
const CIF_REGEX = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;
const PHONE_REGEX = /^\+?[0-9][0-9\s().-]{7,18}[0-9]$/;

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
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                return;
            }

            const parsed = JSON.parse(storedUser);
            const user = parsed.data ?? parsed;
            const organization = user?.organization;

            if (!organization) {
                return;
            }

            setOrganizationName(organization.name ?? "");
            setOrganizationSlug(organization.slug ?? "");
            setTimezone(organization.timezone ?? "Europe/Madrid");
            setLegalName(organization.legalName ?? "");
            setTaxId(organization.taxId ?? "");
            setBusinessType(organization.businessType ?? "company");
            setPhoneNumber(organization.phoneNumber ?? "");
            setIsRegistered(true);
        } catch (error) {
            console.error(
                "Failed to load organization from localStorage:",
                error
            );
        }
    }, []);

    useEffect(() => {
        const slug = organizationSlug.trim();

        setSaveError(null);

        if (!slug || slug.length < MIN_SLUG_LENGTH) {
            setOrganizationSlugAvailability("idle");
            return;
        }

        if (
            slug.length > MAX_SLUG_LENGTH ||
            !SLUG_REGEX.test(slug)
        ) {
            setOrganizationSlugAvailability("idle");
            return;
        }

        const timeout = window.setTimeout(async () => {
            setOrganizationSlugAvailability("checking");

            try {
                const response = await apiFetch(
                    `organization/onboarding/check-slug?slug=${encodeURIComponent(slug)}`
                );

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
        const legalNameValue = legalName.trim();
        const taxIdValue = taxId.trim().toUpperCase();
        const phoneValue = phoneNumber.trim();

        if (!name) {
            errors.name = "Organization name is required.";
        } else if (name.length < MIN_ORGANIZATION_NAME_LENGTH) {
            errors.name = `Organization name must be at least ${MIN_ORGANIZATION_NAME_LENGTH} characters.`;
        } else if (name.length > MAX_ORGANIZATION_NAME_LENGTH) {
            errors.name = `Organization name must not exceed ${MAX_ORGANIZATION_NAME_LENGTH} characters.`;
        }

        if (!slug) {
            errors.slug = "Organization slug is required.";
        } else if (slug.length < MIN_SLUG_LENGTH) {
            errors.slug = `Organization slug must be at least ${MIN_SLUG_LENGTH} characters.`;
        } else if (slug.length > MAX_SLUG_LENGTH) {
            errors.slug = `Organization slug must not exceed ${MAX_SLUG_LENGTH} characters.`;
        } else if (!SLUG_REGEX.test(slug)) {
            errors.slug =
                "Organization slug can only contain lowercase letters, numbers and hyphens.";
        } else if (organizationSlugAvailability === "unavailable") {
            errors.slug = "This organization slug is already taken.";
        } else if (organizationSlugAvailability !== "available") {
            errors.slug =
                "Please wait until the organization slug is available.";
        }

        if (!legalNameValue) {
            errors.legal_name = "Legal name is required.";
        } else if (legalNameValue.length < MIN_LEGAL_NAME_LENGTH) {
            errors.legal_name = `Legal name must be at least ${MIN_LEGAL_NAME_LENGTH} characters.`;
        } else if (legalNameValue.length > MAX_LEGAL_NAME_LENGTH) {
            errors.legal_name = `Legal name must not exceed ${MAX_LEGAL_NAME_LENGTH} characters.`;
        }

        if (!taxIdValue) {
            errors.tax_id = "NIF / Tax ID is required.";
        } else if (
            taxIdValue.length < MIN_TAX_ID_LENGTH ||
            taxIdValue.length > MAX_TAX_ID_LENGTH
        ) {
            errors.tax_id = `Tax ID must be between ${MIN_TAX_ID_LENGTH} and ${MAX_TAX_ID_LENGTH} characters.`;
        } else if (
            !DNI_REGEX.test(taxIdValue) &&
            !NIE_REGEX.test(taxIdValue) &&
            !CIF_REGEX.test(taxIdValue)
        ) {
            errors.tax_id =
                "Please enter a valid Spanish NIF, NIE or CIF.";
        }

        if (!businessType) {
            errors.business_type = "Business type is required.";
        } else if (
            !["company", "individual", "non_profit"].includes(businessType)
        ) {
            errors.business_type = "Invalid business type.";
        }

        if (!phoneValue) {
            errors.phone_number = "Phone number is required.";
        } else {
            const normalizedPhone = phoneValue.replace(
                /[\s().-]/g,
                ""
            );

            if (
                normalizedPhone.length < MIN_PHONE_LENGTH ||
                normalizedPhone.length > MAX_PHONE_LENGTH
            ) {
                errors.phone_number = `Phone number must be between ${MIN_PHONE_LENGTH} and ${MAX_PHONE_LENGTH} digits.`;
            } else if (!PHONE_REGEX.test(phoneValue)) {
                errors.phone_number =
                    "Please enter a valid phone number.";
            }
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (isRegistered) {
            return;
        }

        setSaveError(null);

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);

        try {
            const response = await apiFetch(
                "organization/onboarding/register-organization",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: organizationName.trim(),
                        slug: organizationSlug.trim(),
                        timezone,
                        legal_name: legalName.trim(),
                        tax_id: taxId.trim().toUpperCase(),
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

            /*
             * Refresh the authenticated user so the new
             * organization/onboarding state is stored locally.
             */
            const meResponse = await apiFetch("organization/auth/me");

            if (meResponse.ok) {
                const meData = await meResponse.json();
                const updatedUser = meData.data ?? meData;

                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );
            }

            setIsRegistered(true);
            setFieldErrors({});
            setSaveError(null);

            window.dispatchEvent(
                new Event("organization-registered")
            );
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
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

    const selectClassName =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

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
                            maxLength={MAX_ORGANIZATION_NAME_LENGTH}
                            disabled={isRegistered}
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
                            minLength={MIN_SLUG_LENGTH}
                            maxLength={MAX_SLUG_LENGTH}
                            disabled={isRegistered}
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

                        {!isRegistered &&
                            organizationSlug.trim().length > 0 &&
                            organizationSlug.trim().length <
                            MIN_SLUG_LENGTH && (
                                <p className="mt-2 text-sm text-red-600">
                                    Organization slug must be at least{" "}
                                    {MIN_SLUG_LENGTH} characters.
                                </p>
                            )}

                        {!isRegistered &&
                            organizationSlug.trim().length >=
                            MIN_SLUG_LENGTH &&
                            organizationSlug.trim().length <=
                            MAX_SLUG_LENGTH && (
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
                    disabled={isRegistered}
                />

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
                                minLength={MIN_LEGAL_NAME_LENGTH}
                                maxLength={MAX_LEGAL_NAME_LENGTH}
                                disabled={isRegistered}
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
                                minLength={MIN_TAX_ID_LENGTH}
                                maxLength={MAX_TAX_ID_LENGTH}
                                disabled={isRegistered}
                                onChange={(event) => {
                                    setTaxId(
                                        event.target.value
                                            .toUpperCase()
                                            .replace(/\s+/g, "")
                                    );

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
                                disabled={isRegistered}
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
                                maxLength={MAX_PHONE_LENGTH}
                                disabled={isRegistered}
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

            {!isRegistered && (
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : t.save}
                    </button>
                </div>
            )}
        </section>
    );
}
