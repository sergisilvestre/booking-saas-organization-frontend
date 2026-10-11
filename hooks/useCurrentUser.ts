"use client";

import {
  useCurrentUserContext,
  type CurrentUser,
} from "@/components/providers/CurrentUserProvider";

export type { CurrentUser };

export function useCurrentUser() {
  return useCurrentUserContext();
}
