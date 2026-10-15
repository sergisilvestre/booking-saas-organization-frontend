
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

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

type StoredUser = {
    name?: string;
    email?: string;
    organization?: {
        name?: string;
        slug?: string;
        timezone?: string;
        legalName?: string;
        legal_name?: string;
        taxId?: string;
        tax_id?: string;
        businessType?: string;
        business_type?: string;
        phoneNumber?: string;
        phone_number?: string;
    };
};

const USER_STORAGE_KEY = "user";

const MIN_ORGANIZATION_NAME_LENGTH = 5;
const MAX_ORGANIZATION_NAME_LENGTH = 100;

const MIN_SLUG_LENGTH = 5;
const MAX_SLUG_LENGTH = 50;

const MIN_LEGAL_NAME_LENGTH = 5;
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

type ValidationKey =
    | "nameRequired"
    | "nameMin"
    | "nameMax"
    | "slugRequired"
    | "slugMin"
    | "slugMax"
    | "slugInvalid"
    | "slugTaken"
    | "slugChecking"
    | "legalNameRequired"
    | "legalNameMin"
    | "legalNameMax"
    | "taxIdRequired"
    | "taxIdLength"
    | "taxIdInvalid"
    | "businessTypeRequired"
    | "businessTypeInvalid"
    | "phoneRequired"
    | "phoneLength"
    | "phoneInvalid"
    | "checkForm"
    | "saveFailed";

export default function OrganizationSettings({
    translations: t,
}: Props) {
    const tv = useTranslations("validation");

    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");

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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [isSaving, setIsSaving] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const isFirstSlugCheck = useRef(true);
    const slugRequestId = useRef(0);

    const translateBackendError = (
        field: string,
        message: string,
    ): string => {
        const normalized = message.toLowerCase();

        const isRequired =
            normalized.includes("required") ||
            normalized.includes("is required") ||
            normalized.includes("obligatorio") ||
            normalized.includes("obligatoria");

        const isTooShort =
            normalized.includes("at least") ||
            normalized.includes("minimum") ||
            normalized.includes("min:") ||
            normalized.includes("min.") ||
            normalized.includes("too short");

        const isTooLong =
            normalized.includes("at most") ||
            normalized.includes("maximum") ||
            normalized.includes("max:") ||
            normalized.includes("max.") ||
            normalized.includes("too long");

        const isUnique =
            normalized.includes("already been taken") ||
            normalized.includes("already exists") ||
            normalized.includes("has already been taken") ||
            normalized.includes("unique") ||
            normalized.includes("taken");

        let key: ValidationKey = "checkForm";

        switch (field) {
            case "name":
                if (isRequired) key = "nameRequired";
                else if (isTooShort) key = "nameMin";
                else if (isTooLong) key = "nameMax";
                break;

            case "slug":
                if (isRequired) key = "slugRequired";
                else if (isTooShort) key = "slugMin";
                else if (isTooLong) key = "slugMax";
                else if (isUnique) key = "slugTaken";
                else if (
                    normalized.includes("format") ||
                    normalized.includes("regex") ||
                    normalized.includes("lowercase") ||
                    normalized.includes("invalid")
                ) {
                    key = "slugInvalid";
                }
                break;

            case "legal_name":
                if (isRequired) key = "legalNameRequired";
                else if (isTooShort) key = "legalNameMin";
                else if (isTooLong) key = "legalNameMax";
                break;

            case "tax_id":
                if (isRequired) key = "taxIdRequired";
                else if (isTooShort || isTooLong) key = "taxIdLength";
                else key = "taxIdInvalid";
                break;

            case "business_type":
                key = isRequired
                    ? "businessTypeRequired"
                    : "businessTypeInvalid";
                break;

            case "phone_number":
                if (isRequired) key = "phoneRequired";
                else if (isTooShort || isTooLong) key = "phoneLength";
                else key = "phoneInvalid";
                break;
        }

        switch (key) {
            case "nameMin":
                return tv(key, { min: MIN_ORGANIZATION_NAME_LENGTH });
            case "nameMax":
                return tv(key, { max: MAX_ORGANIZATION_NAME_LENGTH });
            case "slugMin":
                return tv(key, { min: MIN_SLUG_LENGTH });
            case "slugMax":
                return tv(key, { max: MAX_SLUG_LENGTH });
            case "legalNameMin":
                return tv(key, { min: MIN_LEGAL_NAME_LENGTH });
            case "legalNameMax":
                return tv(key, { max: MAX_LEGAL_NAME_LENGTH });
            case "taxIdLength":
                return tv(key, {
                    min: MIN_TAX_ID_LENGTH,
                    max: MAX_TAX_ID_LENGTH,
                });
            case "phoneLength":
                return tv(key, {
                    min: MIN_PHONE_LENGTH,
                    max: MAX_PHONE_LENGTH,
                });
            default:
                return tv(key);
        }
    };

    const mapBackendErrors = (
        backendErrors: Record<string, unknown>,
    ): Record<string, string> => {
        const result: Record<string, string> = {};

        for (const field of [
            "name",
            "slug",
            "legal_name",
            "tax_id",
            "business_type",
            "phone_number",
        ]) {
            const value = backendErrors[field];

            if (!value) continue;

            const messages = Array.isArray(value) ? value : [value];
            const firstMessage = messages.find(
                (item): item is string => typeof item === "string",
            );

            if (firstMessage) {
                result[field] = translateBackendError(field, firstMessage);
            } else {
                result[field] = tv("checkForm");
            }
        }

        return result;
    };

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(USER_STORAGE_KEY);

            if (!storedUser) return;

            const parsed = JSON.parse(storedUser);
            const user: StoredUser = parsed?.data ?? parsed;

            setUserName(user?.name ?? "");
            setUserEmail(user?.email ?? "");

            const organization = user?.organization;

            if (!organization) return;

            setOrganizationName(organization.name ?? "");
            setOrganizationSlug(organization.slug ?? "");
            setTimezone(organization.timezone ?? "Europe/Madrid");

            setLegalName(
                organization.legalName ?? organization.legal_name ?? "",
            );

            setTaxId(organization.taxId ?? organization.tax_id ?? "");

            setBusinessType(
                organization.businessType ??
                organization.business_type ??
                "company",
            );

            setPhoneNumber(
                organization.phoneNumber ??
                organization.phone_number ??
                "",
            );

            setIsRegistered(true);
        } catch (error) {
            console.error(
                "Failed to load user/organization from localStorage:",
                error,
            );
        } finally {
            setIsInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (isFirstSlugCheck.current) {
            isFirstSlugCheck.current = false;
            return;
        }

        const slug = organizationSlug.trim();
        const requestId = ++slugRequestId.current;

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
                    `organization/onboarding/check-slug?slug=${encodeURIComponent(slug)}`,
                    { showLoading: false },
                );

                if (requestId !== slugRequestId.current) return;

                if (!response.ok) {
                    setOrganizationSlugAvailability("idle");
                    return;
                }

                const data = await response.json();

                if (requestId !== slugRequestId.current) return;

                setOrganizationSlugAvailability(
                    data.exists === false ? "available" : "unavailable",
                );
            } catch (error) {
                if (requestId !== slugRequestId.current) return;

                console.error(
                    "Organization slug availability check failed:",
                    error,
                );

                setOrganizationSlugAvailability("idle");
            }
        }, 400);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [organizationSlug]);

    const validateForm = () => {
        const errors: Record<string, string> = {};

        const name = organizationName.trim();
        const slug = organizationSlug.trim();
        const legalNameValue = legalName.trim();
        const taxIdValue = taxId.trim().toUpperCase();
        const phoneValue = phoneNumber.trim();

        if (!name) {
            errors.name = tv("nameRequired");
        } else if (name.length < MIN_ORGANIZATION_NAME_LENGTH) {
            errors.name = tv("nameMin", {
                min: MIN_ORGANIZATION_NAME_LENGTH,
            });
        } else if (name.length > MAX_ORGANIZATION_NAME_LENGTH) {
            errors.name = tv("nameMax", {
                max: MAX_ORGANIZATION_NAME_LENGTH,
            });
        }

        if (!slug) {
            errors.slug = tv("slugRequired");
        } else if (slug.length < MIN_SLUG_LENGTH) {
            errors.slug = tv("slugMin", { min: MIN_SLUG_LENGTH });
        } else if (slug.length > MAX_SLUG_LENGTH) {
            errors.slug = tv("slugMax", { max: MAX_SLUG_LENGTH });
        } else if (!SLUG_REGEX.test(slug)) {
            errors.slug = tv("slugInvalid");
        } else if (organizationSlugAvailability === "unavailable") {
            errors.slug = tv("slugTaken");
        } else if (organizationSlugAvailability !== "available") {
            errors.slug = tv("slugChecking");
        }

        if (!legalNameValue) {
            errors.legal_name = tv("legalNameRequired");
        } else if (legalNameValue.length < MIN_LEGAL_NAME_LENGTH) {
            errors.legal_name = tv("legalNameMin", {
                min: MIN_LEGAL_NAME_LENGTH,
            });
        } else if (legalNameValue.length > MAX_LEGAL_NAME_LENGTH) {
            errors.legal_name = tv("legalNameMax", {
                max: MAX_LEGAL_NAME_LENGTH,
            });
        }

        if (!taxIdValue) {
            errors.tax_id = tv("taxIdRequired");
        } else if (
            taxIdValue.length < MIN_TAX_ID_LENGTH ||
            taxIdValue.length > MAX_TAX_ID_LENGTH
        ) {
            errors.tax_id = tv("taxIdLength", {
                min: MIN_TAX_ID_LENGTH,
                max: MAX_TAX_ID_LENGTH,
            });
        } else if (
            !DNI_REGEX.test(taxIdValue) &&
            !NIE_REGEX.test(taxIdValue) &&
            !CIF_REGEX.test(taxIdValue)
        ) {
            errors.tax_id = tv("taxIdInvalid");
        }

        if (!businessType) {
            errors.business_type = tv("businessTypeRequired");
        } else if (
            !["company", "individual", "non_profit"].includes(businessType)
        ) {
            errors.business_type = tv("businessTypeInvalid");
        }

        if (!phoneValue) {
            errors.phone_number = tv("phoneRequired");
        } else {
            const normalizedPhone = phoneValue.replace(/[\s().-]/g, "");

            if (
                normalizedPhone.length < MIN_PHONE_LENGTH ||
                normalizedPhone.length > MAX_PHONE_LENGTH
            ) {
                errors.phone_number = tv("phoneLength", {
                    min: MIN_PHONE_LENGTH,
                    max: MAX_PHONE_LENGTH,
                });
            } else if (!PHONE_REGEX.test(phoneValue)) {
                errors.phone_number = tv("phoneInvalid");
            }
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    useEffect(() => {
        if (!isInitialized || isRegistered) return;

        validateForm();
    }, [
        isInitialized,
        isRegistered,
        organizationName,
        organizationSlug,
        organizationSlugAvailability,
        legalName,
        taxId,
        businessType,
        phoneNumber,
    ]);

    const handleSave = async () => {
        if (isRegistered) return;

        setSaveError(null);

        if (!validateForm()) return;

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
                },
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                if (response.status === 422) {
                    const backendErrors =
                        data?.errors ?? data?.data?.errors ?? {};

                    setFieldErrors(mapBackendErrors(backendErrors));
                    setSaveError(tv("checkForm"));

                    return;
                }

                setSaveError(tv("saveFailed"));
                return;
            }

            const meResponse = await apiFetch("organization/auth/me");

            if (meResponse.ok) {
                const meData = await meResponse.json();
                const updatedUser = meData.data ?? meData;

                localStorage.setItem(
                    USER_STORAGE_KEY,
                    JSON.stringify(updatedUser),
                );

                setUserName(updatedUser?.name ?? "");
                setUserEmail(updatedUser?.email ?? "");
            }

            setIsRegistered(true);
            setFieldErrors({});
            setSaveError(null);

            window.dispatchEvent(new Event("organization-registered"));
        } catch (error) {
            console.error("Unable to save organization:", error);
            setSaveError(tv("saveFailed"));
        } finally {
            setIsSaving(false);
        }
    };

    const inputClassName =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

    const selectClassName =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

    const errorClassName = "border-red-500 focus:border-red-500 focus:ring-red-500";

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900">
                    {t.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{t.description}</p>
            </div>

            <div className="space-y-6">
                <div>
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
                                minLength={MIN_ORGANIZATION_NAME_LENGTH}
                                maxLength={MAX_ORGANIZATION_NAME_LENGTH}
                                disabled={isRegistered}
                                onChange={(event) =>
                                    setOrganizationName(event.target.value)
                                }
                                placeholder={t.namePlaceholder}
                                autoComplete="organization"
                                className={`${inputClassName} ${fieldErrors.name ? errorClassName : ""}`}
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
                                }}
                                placeholder={t.slugPlaceholder}
                                autoComplete="off"
                                className={`${inputClassName} ${fieldErrors.slug ? errorClassName : ""}`}
                            />

                            {!isRegistered &&
                                organizationSlug.trim().length >= MIN_SLUG_LENGTH &&
                                organizationSlug.trim().length <= MAX_SLUG_LENGTH && (
                                    <div className="mt-2 text-sm">
                                        {organizationSlugAvailability === "checking" && (
                                            <span className="text-gray-500">
                                                {tv("slugCheckingStatus")}
                                            </span>
                                        )}
                                        {organizationSlugAvailability === "available" && (
                                            <span className="text-green-600">
                                                {tv("slugAvailable")}
                                            </span>
                                        )}
                                        {organizationSlugAvailability === "unavailable" && (
                                            <span className="text-red-600">
                                                {tv("slugUnavailable")}
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
                                onChange={(event) => setLegalName(event.target.value)}
                                placeholder={t.business.legalNamePlaceholder}
                                autoComplete="organization"
                                className={`${inputClassName} ${fieldErrors.legal_name ? errorClassName : ""}`}
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
                                onChange={(event) =>
                                    setTaxId(
                                        event.target.value
                                            .toUpperCase()
                                            .replace(/\s+/g, ""),
                                    )
                                }
                                placeholder={t.business.taxIdPlaceholder}
                                autoComplete="off"
                                className={`${inputClassName} ${fieldErrors.tax_id ? errorClassName : ""}`}
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
                                onChange={(event) => setBusinessType(event.target.value)}
                                className={`${selectClassName} ${fieldErrors.business_type ? errorClassName : ""}`}
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
                                onChange={(event) => setPhoneNumber(event.target.value)}
                                placeholder={t.business.phoneNumberPlaceholder}
                                autoComplete="tel"
                                className={`${inputClassName} ${fieldErrors.phone_number ? errorClassName : ""}`}
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
                        {isSaving ? tv("saving") : t.save}
                    </button>
                </div>
            )}
        </section>
    );
}
