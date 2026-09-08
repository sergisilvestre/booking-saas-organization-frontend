import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type HomePageProps = {
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

async function getSubscriptionPlans(locale: string) {
  const apiUrl = process.env.INTERNAL_API_URL;

  if (!apiUrl) {
    throw new Error("INTERNAL_API_URL is not configured");
  }

  const response = await fetch(
    `${apiUrl}/api/public/plans?locale=${encodeURIComponent(locale)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 60,
      },
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

  const result: SubscriptionPlansResponse = await response.json();

  return result.data;
}


export default async function HomePage({
  params,
}: HomePageProps) {
  const { lang } = await params;

  const t = await getTranslations({
    locale: lang,
    namespace: "home",
  });

  const [plans] = await Promise.all([
    getSubscriptionPlans(lang),
  ]);

  const features = [
    {
      key: "onlineBookings",
      icon: "📅",
    },
    {
      key: "availability",
      icon: "⏰",
    },
    {
      key: "bookingPage",
      icon: "🔗",
    },
    {
      key: "customers",
      icon: "👥",
    },
    {
      key: "calendar",
      icon: "🗓️",
    },
    {
      key: "payments",
      icon: "💳",
    },
  ];

  const steps = [
    {
      number: "01",
      key: "createAccount",
    },
    {
      number: "02",
      key: "configureServices",
    },
    {
      number: "03",
      key: "shareLink",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href={`/ ${lang} `}
            className="text-xl font-bold tracking-tight"
          >
            Booking
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href={`/ ${lang} #features`}
              className="text-sm text-gray-600 transition hover:text-gray-900"
            >
              {t("header.features")}
            </a>

            <a
              href={`/ ${lang} #how - it - works`}
              className="text-sm text-gray-600 transition hover:text-gray-900"
            >
              {t("header.howItWorks")}
            </a>

            <a
              href={`/ ${lang} #pricing`}
              className="text-sm text-gray-600 transition hover:text-gray-900"
            >
              {t("header.pricing")}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLang={lang} />

            <Link
              href={`/ ${lang}/login`}
              className="hidden px-4 py-2 text-sm font-medium text-gray-700 transition hover:text-gray-900 sm:block"
            >
              {t("header.login")}
            </Link >

            <Link
              href={`/${lang}/register`}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              {t("header.register")}
            </Link>
          </div >
        </div >
      </header >

      {/* Hero */}
      <section className="relative overflow-hidden" >
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
              {t("hero.badge")}
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              {t("hero.title")}

              <span className="block text-gray-500">
                {t("hero.titleHighlight")}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              {t("hero.description")}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={`/${lang}/register`}
                className="w-full rounded-xl bg-gray-900 px-7 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 sm:w-auto"
              >
                {t("hero.register")}
              </Link>

              <a
                href={`/${lang}#how-it-works`}
                className="w-full rounded-xl border border-gray-200 px-7 py-3.5 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
              >
                {t("hero.discover")}
              </a>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              {t("hero.noCreditCard")} · {t("hero.setup")}
            </p>
          </div>

          {/* Dashboard preview */}
          <div className="mx-auto mt-20 max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-2xl">
              <div className="flex h-10 items-center gap-2 border-b border-gray-200 bg-white px-4">
                <span className="h-3 w-3 rounded-full bg-gray-300" />
                <span className="h-3 w-3 rounded-full bg-gray-300" />
                <span className="h-3 w-3 rounded-full bg-gray-300" />
              </div>

              <div className="grid min-h-[420px] grid-cols-12">
                {/* Sidebar */}
                <aside className="col-span-3 hidden border-r border-gray-200 bg-white p-5 md:block">
                  <div className="mb-8 h-5 w-24 rounded bg-gray-200" />

                  <div className="space-y-3">
                    <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium">
                      {t("dashboard.dashboard")}
                    </div>

                    <div className="px-3 py-2 text-sm text-gray-500">
                      {t("dashboard.bookings")}
                    </div>

                    <div className="px-3 py-2 text-sm text-gray-500">
                      {t("dashboard.services")}
                    </div>

                    <div className="px-3 py-2 text-sm text-gray-500">
                      {t("dashboard.availability")}
                    </div>
                  </div>
                </aside>

                {/* Dashboard */}
                <div className="col-span-12 bg-gray-50 p-6 md:col-span-9 md:p-8">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      ["bookingsCount", "128"],
                      ["customers", "84"],
                      ["upcoming", "24"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-gray-200 bg-white p-5"
                      >
                        <p className="text-sm text-gray-500">
                          {t(`dashboard.${label}`)}
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gray-200" />

                            <div>
                              <div className="h-3 w-28 rounded bg-gray-200" />
                              <div className="mt-2 h-3 w-20 rounded bg-gray-100" />
                            </div>
                          </div>

                          <div className="h-3 w-16 rounded bg-gray-100" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Features */}
      <section id="features"
        className="border-t border-gray-100 bg-gray-50 py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              {t("features.eyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("features.title")}
            </h2>

            <p className="mt-4 text-lg text-gray-600">
              {t("features.description")}
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Feature
                key={feature.key}
                icon={feature.icon}
                title={t(
                  `features.items.${feature.key}.title`
                )}
                description={t(
                  `features.items.${feature.key}.description`
                )}
              />
            ))}
          </div>
        </div>
      </section >

      {/* How it works */}
      < section
        id="how-it-works"
        className="py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("howItWorks.title")}
            </h2>

            <p className="mt-4 text-lg text-gray-600">
              {t("howItWorks.description")}
            </p>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {steps.map((step) => (
              <Step
                key={step.key}
                number={step.number}
                title={t(
                  `howItWorks.steps.${step.key}.title`
                )}
                description={t(
                  `howItWorks.steps.${step.key}.description`
                )}
              />
            ))}
          </div>
        </div>
      </ section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-t border-gray-100 bg-gray-50 py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              {t("pricing.eyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("pricing.title")}
            </h2>

            <p className="mt-4 text-lg text-gray-600">
              {t("pricing.description")}
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-8 lg:grid-cols-3">
            {plans.map((plan) => {
              const price = plan.price.amount / 100;
              const highlighted = plan.slug === "pro";

              const sortedFeatures = [...plan.features].sort(
                (a, b) => a.sortOrder - b.sortOrder
              );

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border bg-white p-8 ${highlighted
                    ? "border-gray-900 shadow-xl"
                    : "border-gray-200"
                    }`}
                >
                  {/* Popular badge */}
                  {highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-1 text-xs font-semibold text-white">
                      {t("pricing.mostPopular")}
                    </div>
                  )}

                  {/* Plan name */}
                  <h3 className="text-xl font-semibold text-gray-900">
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 min-h-[48px] text-sm leading-6 text-gray-600">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-8">
                    <span className="text-4xl font-bold tracking-tight">
                      {price}
                      {plan.price.currency === "EUR" ? "€" : ` ${plan.price.currency}`}
                    </span>

                    <span className="ml-1 text-sm text-gray-500">
                      {t("pricing.perMonth")}
                    </span>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/${lang}/register`}
                    className={`mt-8 rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${highlighted
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {price === 0
                      ? t("pricing.startFree")
                      : t("pricing.startNow")}
                  </Link>

                  <div className="my-8 border-t border-gray-100" />

                  {/* Features */}
                  <ul className="space-y-4">
                    {sortedFeatures.map((feature) => (
                      <li
                        key={feature.key}
                        className="flex items-start gap-3 text-sm text-gray-600"
                      >
                        <span className="mt-0.5 font-semibold text-gray-900">
                          ✓
                        </span>

                        <span>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section >

      {/* CTA */}
      < section className="px-6 pb-24 lg:px-8" >
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gray-900 px-6 py-20 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("cta.title")}
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-300">
            {t("cta.description")}
          </p>

          <Link
            href={`/${lang}/register`}
            className="mt-8 inline-flex rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
          >
            {t("cta.button")}
          </Link>
        </div>
      </section >

      {/* Footer */}
      < footer className="border-t border-gray-100" >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>{t("footer.copyright")}</p>

          <div className="flex gap-6">
            <a
              href="#"
              className="hover:text-gray-900"
            >
              {t("footer.privacy")}
            </a>

            <a
              href="#"
              className="hover:text-gray-900"
            >
              {t("footer.terms")}
            </a>
          </div>
        </div>
      </footer >
    </main >
  );
}

function Feature({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 leading-7 text-gray-600">
        {description}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
        {number}
      </div>

      <h3 className="mt-6 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        {description}
      </p>
    </div>
  );
}