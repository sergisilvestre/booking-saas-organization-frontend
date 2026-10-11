"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getOnboardingStatus } from "@/lib/onboarding";

import EmailVerificationWarning from "@/components/onboarding/EmailVerificationWarning";
import OrganizationWarning from "@/components/onboarding/OrganizationWarning";
import StripeWarning from "@/components/onboarding/StripeWarning";

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
