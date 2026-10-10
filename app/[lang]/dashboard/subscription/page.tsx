import { getTranslations } from "next-intl/server";
import { apiFetch } from "@/lib/api";

type Props = {
    params: Promise<{
        lang: string;
    }>;
};

type SubscriptionPlanFeature = {
    key: string;
    name: string;
    sortOrder: number;
};

type SubscriptionPlan = {
    id: string;
    slug: string;
    name: string | null;
    description: string | null;
    price: {
        amount: number;
        currency: string;
    };
    interval: string;
    active: boolean;
    features: SubscriptionPlanFeature[];
};

type SubscriptionPlansResponse = {
    data: SubscriptionPlan[];
};

type PaymentMethod = {
    type: "card";
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
};

async function getSubscriptionPlans(
    locale: string
): Promise<SubscriptionPlan[]> {
    const response = await apiFetch(
        `public/plans?locale=${encodeURIComponent(locale)}`,
        {
            auth: false,
        }
    );

    if (!response.ok) {
        const body = await response.text();

        console.error("Failed to fetch subscription plans:", {
            status: response.status,
            body,
        });

        throw new Error(
            `Failed to fetch subscription plans: ${response.status}`
        );
    }

    const result: SubscriptionPlansResponse =
        await response.json();

    return result.data.filter((plan) => plan.active);
}

export default async function SubscriptionPage({
    params,
}: Props) {
    const { lang } = await params;

    const t = await getTranslations({
        locale: lang,
        namespace: "dashboard.subscription",
    });

    const plans = await getSubscriptionPlans(lang);

    // TODO: Load this from the authenticated backend.
    const paymentMethod: PaymentMethod | null = null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    {t("title")}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    {t("description")}
                </p>
            </div>

            {/* Current plan */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            {t("currentPlan")}
                        </p>

                        <h2 className="mt-1 text-xl font-semibold text-gray-900">
                            Free
                        </h2>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {t("active")}
                    </span>
                </div>
            </div>

            {/* Payment method */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            {t("paymentMethod.title")}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {t("paymentMethod.description")}
                        </p>
                    </div>

                    {paymentMethod && (
                        <button
                            type="button"
                            className="text-sm font-medium text-gray-900 hover:underline"
                        >
                            {t("paymentMethod.change")}
                        </button>
                    )}
                </div>

                <div className="mt-5">
                    {paymentMethod ? (
                        <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-4">
                            <div className="flex h-10 w-14 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold uppercase text-gray-700">
                                {paymentMethod.brand}
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    •••• {paymentMethod.last4}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {t("paymentMethod.expires")}{" "}
                                    {String(
                                        paymentMethod.expMonth
                                    ).padStart(2, "0")}
                                    /
                                    {paymentMethod.expYear}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 p-4">
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {t("paymentMethod.noPaymentMethod")}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {t("paymentMethod.noPaymentMethodDescription")}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                            >
                                {t("paymentMethod.add")}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Plans */}
            <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    {t("plans")}
                </h2>

                <div className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan) => {
                        const price = plan.price.amount / 100;

                        const highlighted =
                            plan.slug === "pro";

                        const sortedFeatures = [
                            ...plan.features,
                        ].sort(
                            (a, b) =>
                                a.sortOrder - b.sortOrder
                        );

                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${highlighted
                                        ? "border-gray-900"
                                        : "border-gray-200"
                                    }`}
                            >
                                {highlighted && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                                        {t("mostPopular")}
                                    </div>
                                )}

                                <h3 className="text-lg font-semibold text-gray-900">
                                    {plan.name ?? plan.slug}
                                </h3>

                                {plan.description && (
                                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-600">
                                        {plan.description}
                                    </p>
                                )}

                                <div className="mt-6">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {price}
                                        {plan.price.currency === "EUR"
                                            ? "€"
                                            : ` ${plan.price.currency}`}
                                    </span>

                                    <span className="ml-1 text-sm text-gray-500">
                                        /
                                        {plan.interval === "month"
                                            ? t("month")
                                            : plan.interval}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    disabled={plan.slug === "free"}
                                    className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${plan.slug === "free"
                                            ? "cursor-not-allowed bg-gray-100 text-gray-500"
                                            : highlighted
                                                ? "bg-gray-900 text-white hover:bg-gray-800"
                                                : "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    {plan.slug === "free"
                                        ? t("currentPlan")
                                        : t("upgrade")}
                                </button>

                                <div className="my-6 border-t border-gray-100" />

                                <ul className="space-y-3">
                                    {sortedFeatures.map((feature) => (
                                        <li
                                            key={feature.key}
                                            className="flex items-start gap-3 text-sm text-gray-600"
                                        >
                                            <span className="mt-0.5 font-semibold text-gray-900">
                                                ✓
                                            </span>

                                            <span>
                                                {feature.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}