"use client";

import { useTranslations } from "next-intl";

export type CurrencyOption = {
    value: string;
    label: string;
    decimals: number;
};

type Props = {
    price: string;
    currency: string;
    currencies: CurrencyOption[];
    configurationLoaded: boolean;
    error?: string;
    onPriceChange: (value: string) => void;
    onCurrencyChange: (value: string) => void;
};

export default function PriceCurrencyFields({
    price,
    currency,
    currencies,
    configurationLoaded,
    error,
    onPriceChange,
    onCurrencyChange,
}: Props) {
    const t = useTranslations("dashboard.eventTypes.form");

    const inputClass =
        "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500";

    const labelClass = "mb-1.5 block text-sm font-semibold text-gray-900";

    const selectedCurrency = currencies.find(
        (item) => item.value === currency,
    );

    const decimals = selectedCurrency?.decimals ?? 2;

    return (
        <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
                {t("payment")}
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="event-price" className={labelClass}>
                        {t("price")}
                    </label>

                    <input
                        id="event-price"
                        type="number"
                        min={decimals === 0 ? "1" : "0.01"}
                        step={decimals === 0 ? "1" : "0.01"}
                        value={price}
                        onChange={(event) =>
                            onPriceChange(event.target.value)
                        }
                        className={inputClass}
                        required
                        aria-invalid={Boolean(error)}
                    />

                    {error && (
                        <p className="mt-1 text-sm text-red-600">
                            {error}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="event-currency" className={labelClass}>
                        {t("currency")}
                    </label>

                    <select
                        id="event-currency"
                        value={currency}
                        onChange={(event) =>
                            onCurrencyChange(event.target.value)
                        }
                        className={inputClass}
                        disabled={
                            !configurationLoaded ||
                            currencies.length === 0
                        }
                        required
                    >
                        <option value="" disabled>
                            {configurationLoaded
                                ? t("currencyPlaceholder")
                                : t("currenciesLoading")}
                        </option>

                        {currencies.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>

                    {configurationLoaded && currencies.length === 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                            {t("currenciesUnavailable")}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}