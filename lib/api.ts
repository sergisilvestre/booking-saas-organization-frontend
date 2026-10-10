const API_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
  showLoading?: boolean;
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
    showLoading = false,
    headers,
    ...fetchOptions
  } = options;

  if (showLoading) {
    startLoading();
  }

  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
