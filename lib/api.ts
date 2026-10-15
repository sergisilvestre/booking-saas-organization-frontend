const API_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

const ORGANIZATION_ID_STORAGE_KEY = "organization_id";

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
  showLoading?: boolean;
  organization?: boolean;
};

let loadingCount = 0;
let loadingListener: ((loading: boolean) => void) | null = null;

export function setLoadingListener(
  listener: ((loading: boolean) => void) | null,
): void {
  loadingListener = listener;
}

function startLoading(): void {
  loadingCount++;
  loadingListener?.(true);
}

function stopLoading(): void {
  loadingCount = Math.max(0, loadingCount - 1);

  if (loadingCount === 0) {
    loadingListener?.(false);
  }
}

export function apiUrl(endpoint: string): string {
  return `${API_URL}/api/${endpoint}`;
}

export async function apiFetch(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const {
    auth = true,
    showLoading = true,
    organization = false,
    headers,
    ...fetchOptions
  } = options;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (auth && !token) {
    return new Response(JSON.stringify({ message: "Unauthenticated." }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (showLoading) {
    startLoading();
  }

  try {
    const requestHeaders = new Headers(headers);

    requestHeaders.set("Accept", "application/json");

    if (fetchOptions.body) {
      requestHeaders.set("Content-Type", "application/json");
    }

    if (auth && token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    return await fetch(apiUrl(endpoint), {
      ...fetchOptions,
      headers: requestHeaders,
    });
  } finally {
    if (showLoading) {
      stopLoading();
    }
  }
}
