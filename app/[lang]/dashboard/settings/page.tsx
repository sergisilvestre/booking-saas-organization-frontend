import { getMessages } from "next-intl/server";
import SettingsForm from "./SettingsForm";
import SettingsWarnings from "./SettingsWarnings";

type Props = {
    params: Promise<{
        lang: string;
    }>;
};

export default async function SettingsPage({ params }: Props) {
    const { lang } = await params;

    const messages = await getMessages({ locale: lang });

    const translations = messages.dashboard.settings;

    const accountNeedsValidation = true;
    const paidBookingsNeedActivation = true;

    const stripeOnboardingUrl = undefined;

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    {translations.title}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {translations.subtitle}
                </p>
            </div>

            <SettingsWarnings
                accountNeedsValidation={accountNeedsValidation}
                paidBookingsNeedActivation={paidBookingsNeedActivation}
                stripeOnboardingUrl={stripeOnboardingUrl}
            />

            <SettingsForm translations={translations} />
        </div>
    );
}