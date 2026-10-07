"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type StoredUser = {
    role?: string;
    onboarding?: {
        status?: string;
    };
};

export default function OnboardingGuard() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname.endsWith("/settings")) {
            return;
        }

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            return;
        }

        try {
            const user: StoredUser = JSON.parse(storedUser);

            if (
                user.role === "owner" &&
                user.onboarding &&
                user.onboarding.status !== "complete"
            ) {
                const lang = pathname.split("/")[1];

                router.replace(`/${lang}/dashboard/settings`);
            }
        } catch {
            // Ignore invalid localStorage data
        }
    }, [pathname, router]);

    return null;
}