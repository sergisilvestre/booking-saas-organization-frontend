import { getTranslations } from "next-intl/server";
import SettingsForm from "./SettingsForm";

type Props = {
    params: Promise<{
        lang: string;
    }>;
};

export default async function SettingsPage({ params }: Props) {
    const { lang } = await params;

    const t = await getTranslations({
        locale: lang,
        namespace: "dashboard.settings",
    });

    /*
     * Aquí posteriormente obtendrás estos datos desde tu API.
     *
     * Ejemplo:
     *
     * const profile = await getProfile();
     * const organization = await getOrganization();
     *
     * De momento dejamos los valores iniciales.
     */

    const profile = {
        name: "",
        email: "",
    };

    const organization = {
        name: "",
        timezone: "Europe/Madrid",
        legalName: "",
        taxId: "",
        businessType: "company",
        phoneNumber: "",
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    {t("title")}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {t("subtitle")}
                </p>
            </div>

            <SettingsForm
                profile={profile}
                organization={organization}
                translations={{
                    organization: {
                        title: t("organization.title"),
                        description: t("organization.description"),

                        name: t("organization.name"),
                        namePlaceholder: t(
                            "organization.namePlaceholder"
                        ),

                        timezone: t("organization.timezone"),

                        business: {
                            title: t(
                                "organization.business.title"
                            ),

                            description: t(
                                "organization.business.description"
                            ),

                            legalName: t(
                                "organization.business.legalName"
                            ),

                            legalNamePlaceholder: t(
                                "organization.business.legalNamePlaceholder"
                            ),

                            taxId: t(
                                "organization.business.taxId"
                            ),

                            taxIdPlaceholder: t(
                                "organization.business.taxIdPlaceholder"
                            ),

                            businessType: t(
                                "organization.business.businessType"
                            ),

                            phoneNumber: t(
                                "organization.business.phoneNumber"
                            ),

                            phoneNumberPlaceholder: t(
                                "organization.business.phoneNumberPlaceholder"
                            ),

                            types: {
                                company: t(
                                    "organization.business.types.company"
                                ),

                                individual: t(
                                    "organization.business.types.individual"
                                ),

                                nonProfit: t(
                                    "organization.business.types.nonProfit"
                                ),
                            },
                        },

                        save: t("organization.save"),
                    },

                    account: {
                        title: t("account.title"),
                        description: t("account.description"),

                        name: t("account.name"),
                        namePlaceholder: t(
                            "account.namePlaceholder"
                        ),

                        email: t("account.email"),
                        emailPlaceholder: t(
                            "account.emailPlaceholder"
                        ),

                        save: t("account.save"),
                    },

                    security: {
                        title: t("security.title"),
                        description: t(
                            "security.description"
                        ),

                        changePassword: t(
                            "security.changePassword"
                        ),
                    },

                    danger: {
                        title: t("danger.title"),
                        description: t(
                            "danger.description"
                        ),

                        delete: t("danger.delete"),
                    },
                }}
            />
        </div>
    );
}