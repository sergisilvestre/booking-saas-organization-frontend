import { apiFetch } from "@/lib/api";

type StripeOnboardingResponse = {
  url?: string;
  message?: string;
};

/**
 * Requests a Stripe onboarding URL from the backend.
 */
export async function createStripeOnboardingSession(): Promise<string> {
  const response = await apiFetch("organization/onboarding/form-data");

  const data: StripeOnboardingResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to start Stripe onboarding.");
  }

  if (!data.url) {
    throw new Error("Stripe onboarding URL was not returned.");
  }

  return data.url;
}
