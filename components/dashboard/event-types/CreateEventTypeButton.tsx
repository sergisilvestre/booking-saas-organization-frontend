"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import PriceCurrencyFields, { CurrencyOption } from "./PriceCurrencyFields";

const DURATIONS = [15, 30, 45, 60, 90, 120] as const;
const BUFFER_OPTIONS = [0, 5, 10, 15, 20, 30, 45, 60] as const;
const NOTICE_OPTIONS = [0, 15, 30, 60, 120, 240, 720, 1440, 2880, 10080] as const;
const ADVANCE_OPTIONS = [7, 14, 30, 60, 90, 120] as const;

const CONFIG_OPTIONS_STORAGE_KEY = "config_options";
const USER_STORAGE_KEY = "user";
const DEFAULT_CURRENCY = "EUR";

type Props = {
    onCreated?: () => void;
};

type ConfigOptionsResponse = {
    currencies?: unknown[];
    default_currency?: string;
};

type StoredUser = {
    features?: {
        payments?: boolean;
    };
};

function normalizeCurrencies(values: unknown[]): CurrencyOption[] {
    const currencies = values
        .map((item): CurrencyOption | null => {
            if (typeof item === "string") {
                const value = item.trim().toUpperCase();

                return value
                    ? { value, label: value, decimals: 2 }
                    : null;
            }

            if (item === null || typeof item !== "object") return null;

            const value =
                "value" in item && typeof item.value === "string"
                    ? item.value.trim().toUpperCase()
                    : "code" in item && typeof item.code === "string"
                        ? item.code.trim().toUpperCase()
                        : "";

            if (!value) return null;

            const label =
                "label" in item && typeof item.label === "string"
                    ? item.label
                    : "name" in item && typeof item.name === "string"
                        ? item.name
                        : value;

            const decimals =
                "decimals" in item &&
                    typeof item.decimals === "number" &&
                    Number.isInteger(item.decimals) &&
                    item.decimals >= 0 &&
                    item.decimals <= 3
                    ? item.decimals
                    : 2;

            return { value, label, decimals };
        })
        .filter((item): item is CurrencyOption => item !== null);

    return currencies.filter(
        (item, index, items) =>
            items.findIndex((candidate) => candidate.value === item.value) === index,
    );
}

function getPaymentsFeature(): boolean {
    try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (!storedUser) return false;

        const user: StoredUser = JSON.parse(storedUser);

        return user?.features?.payments === true;
    } catch {
        return false;
    }
}

export default function CreateEventTypeButton({ onCreated }: Props) {
    const t = useTranslations("dashboard.eventTypes.form");
    const tValidation = useTranslations("validation");

    const [open, setOpen] = useState(false);
    const [hasPayments, setHasPayments] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(30);
    const [bufferBefore, setBufferBefore] = useState(0);
    const [bufferAfter, setBufferAfter] = useState(0);
    const [minimumNotice, setMinimumNotice] = useState(0);
    const [maximumDays, setMaximumDays] = useState(60);

    const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
    const [configurationLoaded, setConfigurationLoaded] = useState(false);

    const [price, setPrice] = useState("");
    const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
    const [isActive, setIsActive] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setHasPayments(getPaymentsFeature());
    }, []);

    useEffect(() => {
        if (!open) return;

        setConfigurationLoaded(false);

        try {
            const storedConfig = localStorage.getItem(CONFIG_OPTIONS_STORAGE_KEY);

            if (!storedConfig) {
                throw new Error("Configuration options not found in localStorage");
            }

            const data: ConfigOptionsResponse = JSON.parse(storedConfig);

            const availableCurrencies = normalizeCurrencies(
                Array.isArray(data.currencies) ? data.currencies : [],
            );

            setCurrencies(availableCurrencies);

            const preferredCurrency = (
                data.default_currency ?? DEFAULT_CURRENCY
            ).toUpperCase();

            const selectedCurrency = availableCurrencies.some(
                (item) => item.value === preferredCurrency,
            )
                ? preferredCurrency
                : availableCurrencies[0]?.value ?? "";

            setCurrency((current) =>
                availableCurrencies.some((item) => item.value === current)
                    ? current
                    : selectedCurrency,
            );
        } catch (error) {
            console.error("Error loading configuration options:", error);
            setCurrencies([]);
        } finally {
            setConfigurationLoaded(true);
        }
    }, [open]);

    function getCurrencyDecimals(currencyCode: string): number {
        return currencies.find((item) => item.value === currencyCode)?.decimals ?? 2;
    }

    function toMinorUnits(amount: string, currencyCode: string): number {
        return Math.round(
            Number(amount) * 10 ** getCurrencyDecimals(currencyCode),
        );
    }

    function generateSlug(value: string): string {
        return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function handleNameChange(value: string) {
        setName(value);
        setSlug(generateSlug(value));
        setErrors((current) => ({
            ...current,
            name: "",
            slug: "",
            form: "",
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSaving) return;

        const nextErrors: Record<string, string> = {};

        if (!name.trim()) {
            nextErrors.name = tValidation("eventType.nameRequired");
        }

        if (!slug.trim()) {
            nextErrors.slug = tValidation("eventType.slugRequired");
        } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            nextErrors.slug = tValidation("eventType.slugInvalid");
        }

        if (!Number.isInteger(duration) || duration <= 0) {
            nextErrors.duration = tValidation("eventType.durationRequired");
        }

        if (
            !Number.isInteger(bufferBefore) ||
            bufferBefore < 0 ||
            !Number.isInteger(bufferAfter) ||
            bufferAfter < 0
        ) {
            nextErrors.buffers = tValidation("eventType.invalidBuffer");
        }

        if (!Number.isInteger(minimumNotice) || minimumNotice < 0) {
            nextErrors.minimumNotice = tValidation("eventType.invalidNotice");
        }

        if (!Number.isInteger(maximumDays) || maximumDays < 1) {
            nextErrors.maximumDays = tValidation("eventType.invalidAdvance");
        }

        let priceAmount: number | null = null;
        let selectedCurrency: string | null = null;

        if (hasPayments) {
            if (!currencies.some((item) => item.value === currency)) {
                nextErrors.currency = tValidation("eventType.currencyInvalid");
            }

            const numericPrice = Number(price);
            const minorUnits = toMinorUnits(price, currency);

            if (price.trim() === "") {
                nextErrors.price = tValidation("eventType.priceRequired");
            } else if (
                !Number.isFinite(numericPrice) ||
                numericPrice <= 0 ||
                !Number.isSafeInteger(minorUnits) ||
                minorUnits <= 0 ||
                (getCurrencyDecimals(currency) === 0 &&
                    !Number.isInteger(numericPrice))
            ) {
                nextErrors.price = tValidation("eventType.priceInvalid");
            }

            if (!nextErrors.price && !nextErrors.currency) {
                priceAmount = minorUnits;
                selectedCurrency = currency;
            }
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) return;

        // La API recibe camelCase; el backend debe mapearlo a sus campos internos.
        const payload = {
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            durationMinutes: duration,
            bufferBeforeMinutes: bufferBefore,
            bufferAfterMinutes: bufferAfter,
            minimumNoticeMinutes: minimumNotice,
            maximumDaysInAdvance: maximumDays,
            priceAmount,
            currency: selectedCurrency,
            isActive,
        };

        setIsSaving(true);

        try {
            const response = await apiFetch("organization/event-types", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                showLoading: true,
                organization: true,
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                if (response.status === 422) {
                    const validationErrors =
                        data?.errors ?? data?.data?.errors;

                    if (
                        validationErrors &&
                        typeof validationErrors === "object"
                    ) {
                        const fieldMap: Record<string, string> = {
                            durationMinutes: "duration",
                            bufferBeforeMinutes: "buffers",
                            bufferAfterMinutes: "buffers",
                            minimumNoticeMinutes: "minimumNotice",
                            maximumDaysInAdvance: "maximumDays",
                            priceAmount: "price",
                        };

                        const mappedErrors: Record<string, string> = {};

                        for (const [field, messages] of Object.entries(
                            validationErrors,
                        )) {
                            const mappedField = fieldMap[field] ?? field;

                            mappedErrors[mappedField] = Array.isArray(messages)
                                ? String(messages[0] ?? "")
                                : String(messages);
                        }

                        setErrors(mappedErrors);
                        return;
                    }
                }

                throw new Error(
                    data?.message ??
                    data?.data?.message ??
                    "Failed to create event type.",
                );
            }

            onCreated?.();
            handleClose();
        } catch (error) {
            console.error("Error creating event type:", error);

            setErrors((current) => ({
                ...current,
                form:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred.",
            }));
        } finally {
            setIsSaving(false);
        }
    }

    function handleClose() {
        if (isSaving) return;

        setOpen(false);
        setErrors({});
    }

    const inputClass =
        "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500";

    const labelClass = "mb-1.5 block text-sm font-semibold text-gray-900";

    function renderError(field: string) {
        if (!errors[field]) return null;

        return <p className="mt-1 text-sm text-red-600">{errors[field]}</p>;
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
                {t("open")}
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) handleClose();
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-event-title"
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="create-event-title"
                                    className="text-xl font-bold text-gray-900"
                                >
                                    {t("title")}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {t("description")}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label={t("close")}
                                disabled={isSaving}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                >
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="event-name" className={labelClass}>
                                    {t("name")}
                                </label>
                                <input
                                    id="event-name"
                                    value={name}
                                    onChange={(event) =>
                                        handleNameChange(event.target.value)
                                    }
                                    maxLength={255}
                                    autoFocus
                                    required
                                    className={inputClass}
                                    placeholder={t("namePlaceholder")}
                                    aria-invalid={Boolean(errors.name)}
                                />
                                {renderError("name")}
                            </div>

                            <div>
                                <label htmlFor="event-slug" className={labelClass}>
                                    {t("slug")}
                                </label>
                                <input
                                    id="event-slug"
                                    value={slug}
                                    onChange={(event) => {
                                        setSlug(generateSlug(event.target.value));
                                        setErrors((current) => ({
                                            ...current,
                                            slug: "",
                                            form: "",
                                        }));
                                    }}
                                    maxLength={255}
                                    required
                                    className={inputClass}
                                    placeholder={t("slugPlaceholder")}
                                    aria-invalid={Boolean(errors.slug)}
                                />
                                {renderError("slug")}
                            </div>

                            <div>
                                <label
                                    htmlFor="event-description"
                                    className={labelClass}
                                >
                                    {t("descriptionLabel")}
                                </label>
                                <textarea
                                    id="event-description"
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    rows={3}
                                    maxLength={10000}
                                    className={inputClass}
                                    placeholder={t("descriptionPlaceholder")}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="event-duration"
                                        className={labelClass}
                                    >
                                        {t("duration")}
                                    </label>
                                    <select
                                        id="event-duration"
                                        value={duration}
                                        onChange={(event) =>
                                            setDuration(Number(event.target.value))
                                        }
                                        className={inputClass}
                                        required
                                    >
                                        {DURATIONS.map((minutes) => (
                                            <option key={minutes} value={minutes}>
                                                {t("minutes", { count: minutes })}
                                            </option>
                                        ))}
                                    </select>
                                    {renderError("duration")}
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                                    {t("availability")}
                                </h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="event-buffer-before"
                                            className={labelClass}
                                        >
                                            {t("bufferBefore")}
                                        </label>
                                        <select
                                            id="event-buffer-before"
                                            value={bufferBefore}
                                            onChange={(event) =>
                                                setBufferBefore(Number(event.target.value))
                                            }
                                            className={inputClass}
                                            required
                                        >
                                            {BUFFER_OPTIONS.map((minutes) => (
                                                <option key={minutes} value={minutes}>
                                                    {t("minutes", { count: minutes })}
                                                </option>
                                            ))}
                                        </select>
                                        {renderError("buffers")}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="event-buffer-after"
                                            className={labelClass}
                                        >
                                            {t("bufferAfter")}
                                        </label>
                                        <select
                                            id="event-buffer-after"
                                            value={bufferAfter}
                                            onChange={(event) =>
                                                setBufferAfter(Number(event.target.value))
                                            }
                                            className={inputClass}
                                            required
                                        >
                                            {BUFFER_OPTIONS.map((minutes) => (
                                                <option key={minutes} value={minutes}>
                                                    {t("minutes", { count: minutes })}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="event-minimum-notice"
                                            className={labelClass}
                                        >
                                            {t("minimumNotice")}
                                        </label>
                                        <select
                                            id="event-minimum-notice"
                                            value={minimumNotice}
                                            onChange={(event) =>
                                                setMinimumNotice(Number(event.target.value))
                                            }
                                            className={inputClass}
                                            required
                                        >
                                            {NOTICE_OPTIONS.map((minutes) => (
                                                <option key={minutes} value={minutes}>
                                                    {t("minutes", { count: minutes })}
                                                </option>
                                            ))}
                                        </select>
                                        {renderError("minimumNotice")}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="event-maximum-days"
                                            className={labelClass}
                                        >
                                            {t("maximumDaysInAdvance")}
                                        </label>
                                        <select
                                            id="event-maximum-days"
                                            value={maximumDays}
                                            onChange={(event) =>
                                                setMaximumDays(Number(event.target.value))
                                            }
                                            className={inputClass}
                                            required
                                        >
                                            {ADVANCE_OPTIONS.map((days) => (
                                                <option key={days} value={days}>
                                                    {t("days", { count: days })}
                                                </option>
                                            ))}
                                        </select>
                                        {renderError("maximumDays")}
                                    </div>
                                </div>
                            </div>

                            {hasPayments && (
                                <PriceCurrencyFields
                                    price={price}
                                    currency={currency}
                                    currencies={currencies}
                                    configurationLoaded={configurationLoaded}
                                    priceError={errors.price}
                                    currencyError={errors.currency}
                                    onPriceChange={(value) => {
                                        setPrice(value);
                                        setErrors((current) => ({
                                            ...current,
                                            price: "",
                                            form: "",
                                        }));
                                    }}
                                    onCurrencyChange={(value) => {
                                        setCurrency(value);
                                        setErrors((current) => ({
                                            ...current,
                                            price: "",
                                            currency: "",
                                            form: "",
                                        }));
                                    }}
                                />
                            )}

                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(event) =>
                                        setIsActive(event.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                                />
                                <span>
                                    <span className="block text-sm font-medium text-gray-900">
                                        {t("isActive")}
                                    </span>
                                    <span className="mt-0.5 block text-sm text-gray-500">
                                        {t("isActiveDescription")}
                                    </span>
                                </span>
                            </label>

                            {errors.form && (
                                <p role="alert" className="text-sm text-red-600">
                                    {errors.form}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSaving}
                                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {t("cancel")}
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        isSaving ||
                                        !configurationLoaded ||
                                        (hasPayments && currencies.length === 0)
                                    }
                                    className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : t("submit")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}