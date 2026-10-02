"use client";

import { useEffect, useState } from "react";
import OrganizationSettings from "./OrganizationSettings";
import AccountSettings from "./AccountSettings";
import SecuritySettings from "./SecuritySettings";
import DangerZone from "./DangerZone";

type User = {
    id: string;
    name: string;
    email: string;
};

type Props = {
    translations: {
        organization: {
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

const USER_STORAGE_KEY = "user";

export default function SettingsForm({ translations: t }: Props) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (!storedUser) {
            return;
        }

        try {
            const parsed = JSON.parse(storedUser);
            const storedUserData: User = parsed.data ?? parsed;

            if (
                storedUserData &&
                typeof storedUserData.name === "string" &&
                typeof storedUserData.email === "string"
            ) {
                setUser(storedUserData);
            }
        } catch {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    }, []);

    return (
        <div className="space-y-6">
            <OrganizationSettings
                translations={t.organization}
            />

            <AccountSettings
                translations={t.account}
                user={user}
            />

            <SecuritySettings
                translations={t.security}
            />

            <DangerZone
                translations={t.danger}
            />
        </div>
    );
}