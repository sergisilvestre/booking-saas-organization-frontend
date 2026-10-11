export type OnboardingUser = {
  role?: string;
  email_verified?: boolean;
  onboarding?: {
    status?: string;
  };
  organization?: {
    name?: string;
    slug?: string;
  };
  features?: {
    payments?: boolean;
  };
};

export type OnboardingStatus = {
  emailNeedsValidation: boolean;
  organizationNeedsValidation: boolean;
  paymentsNeedActivation: boolean;
  isComplete: boolean;
};

export function getOnboardingStatus(
  user: OnboardingUser | null,
): OnboardingStatus {
  const emailNeedsValidation = user?.email_verified === false;

  const organizationNeedsValidation =
    !emailNeedsValidation && user?.onboarding?.status !== "complete";

  const paymentsNeedActivation =
    !emailNeedsValidation &&
    !organizationNeedsValidation &&
    user?.role === "owner" &&
    user.organization !== undefined &&
    user.features?.payments !== true;

  return {
    emailNeedsValidation,
    organizationNeedsValidation,
    paymentsNeedActivation,
    isComplete:
      !emailNeedsValidation &&
      !organizationNeedsValidation &&
      !paymentsNeedActivation,
  };
}
