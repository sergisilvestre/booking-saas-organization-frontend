"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getOnboardingStatus } from "@/lib/onboarding";
import EmailVerificationWarning from "./EmailVerificationWarning";
import OrganizationWarning from "./OrganizationWarning";
import StripeWarning from "./StripeWarning";


export default function SettingsWarnings() {
    const { user, loadingUser } = useCurrentUser();

    const {
        emailNeedsValidation,
        organizationNeedsValidation,
        paymentsNeedActivation,
    } = getOnboardingStatus(user);

    if (loadingUser) {
        return null;
    }

    if (
        !emailNeedsValidation &&
        !organizationNeedsValidation &&
        !paymentsNeedActivation
    ) {
        return null;
    }

    return (
        <div className="mb-6 space-y-3">
            {emailNeedsValidation && (
                <EmailVerificationWarning email={user?.email} />
            )}

            {organizationNeedsValidation && (
                <OrganizationWarning />
            )}

            {paymentsNeedActivation && (
                <StripeWarning />
            )}
        </div>
    );
}
