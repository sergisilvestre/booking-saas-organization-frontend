"use client";

import TimezoneField from "@/components/TimezoneField";
import { useState } from "react";

type Props = {
    translations: {
        organization: {
            title: string;
            description: string;
            name: string;
            namePlaceholder: string;
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

        account: {
            title: string;
            description: string;
            name: string;
            namePlaceholder: string;
            email: string;
            emailPlaceholder: string;
            save: string;
        };

        security: {
            title: string;
            description: string;
            changePassword: string;
        };

        danger: {
            title: string;
            description: string;
            delete: string;
        };
    };
};

export default function SettingsForm({
    translations: t,
}: Props) {
    const [timezone, setTimezone] = useState("Europe/Madrid");

    return (
        <div className="space-y-6">
            {/* Organization */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900">
                        {t.organization.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        {t.organization.description}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Organization name + timezone */}
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="organization-name"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                {t.organization.name}
                            </label>

                            <input
                                id="organization-name"
                                name="name"
                                type="text"
                                defaultValue=""
                                placeholder={
                                    t.organization.namePlaceholder
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                        </div>

                        <TimezoneField
                            id="organization-timezone"
                            value={timezone}
                            onChange={setTimezone}
                            label={t.organization.timezone}
                        />
                    </div>

                    {/* Business details */}
                    <div className="border-t border-gray-100 pt-6">
                        <div className="mb-5">
                            <h4 className="text-sm font-semibold text-gray-900">
                                {t.organization.business.title}
                            </h4>

                            <p className="mt-1 text-sm text-gray-500">
                                {t.organization.business.description}
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            {/* Legal name */}
                            <div>
                                <label
                                    htmlFor="legal-name"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    {
                                        t.organization.business
                                            .legalName
                                    }
                                </label>

                                <input
                                    id="legal-name"
                                    name="legal_name"
                                    type="text"
                                    defaultValue=""
                                    placeholder={
                                        t.organization.business
                                            .legalNamePlaceholder
                                    }
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                />
                            </div>

                            {/* Tax ID */}
                            <div>
                                <label
                                    htmlFor="tax-id"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    {t.organization.business.taxId}
                                </label>

                                <input
                                    id="tax-id"
                                    name="tax_id"
                                    type="text"
                                    defaultValue=""
                                    placeholder={
                                        t.organization.business
                                            .taxIdPlaceholder
                                    }
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                />
                            </div>

                            {/* Business type */}
                            <div>
                                <label
                                    htmlFor="business-type"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    {
                                        t.organization.business
                                            .businessType
                                    }
                                </label>

                                <select
                                    id="business-type"
                                    name="business_type"
                                    defaultValue="company"
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                >
                                    <option value="company">
                                        {
                                            t.organization.business
                                                .types.company
                                        }
                                    </option>

                                    <option value="individual">
                                        {
                                            t.organization.business
                                                .types.individual
                                        }
                                    </option>

                                    <option value="non_profit">
                                        {
                                            t.organization.business
                                                .types.nonProfit
                                        }
                                    </option>
                                </select>
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="phone-number"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    {
                                        t.organization.business
                                            .phoneNumber
                                    }
                                </label>

                                <input
                                    id="phone-number"
                                    name="phone_number"
                                    type="tel"
                                    defaultValue=""
                                    placeholder={
                                        t.organization.business
                                            .phoneNumberPlaceholder
                                    }
                                    autoComplete="tel"
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        {t.organization.save}
                    </button>
                </div>
            </section>

            {/* Account */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900">
                        {t.account.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        {t.account.description}
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            {t.account.name}
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder={
                                t.account.namePlaceholder
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            {t.account.email}
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={
                                t.account.emailPlaceholder
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        {t.account.save}
                    </button>
                </div>
            </section>

            {/* Security */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900">
                        {t.security.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        {t.security.description}
                    </p>
                </div>

                <button
                    type="button"
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                    {t.security.changePassword}
                </button>
            </section>

            {/* Danger zone */}
            <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-base font-semibold text-red-600">
                        {t.danger.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        {t.danger.description}
                    </p>
                </div>

                <button
                    type="button"
                    className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                    {t.danger.delete}
                </button>
            </section>
        </div>
    );
}