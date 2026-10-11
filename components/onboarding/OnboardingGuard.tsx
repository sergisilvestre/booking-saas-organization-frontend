"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getOnboardingStatus } from "@/lib/onboarding";

const SETTINGS_ROUTE = "/dashboard/settings";

type Props = {
    children: ReactNode;
    lang: string;
};

export default function OnboardingGuard({ children, lang }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const { user, loadingUser } = useCurrentUser();

    const {
        emailNeedsValidation,
        organizationNeedsValidation,
    } = getOnboardingStatus(user);

    const settingsPath = `/${lang}${SETTINGS_ROUTE}`;

    const needsOnboarding =
        emailNeedsValidation || organizationNeedsValidation;

    useEffect(() => {
        if (loadingUser || !user || !needsOnboarding) {
            return;
        }

        if (pathname !== settingsPath) {
            router.replace(settingsPath);
        }
    }, [
        loadingUser,
        user,
        needsOnboarding,
        pathname,
        settingsPath,
        router,
    ]);

    if (loadingUser || !user) {
        return null;
    }

    if (needsOnboarding && pathname !== settingsPath) {
        return null;
    }

    return children;
}