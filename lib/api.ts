const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

export function apiUrl(endpoint: string): string {
  return `${API_URL}/api/${endpoint}`;
}

export async function apiFetch(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const { auth = true, headers, ...fetchOptions } = options;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");

  if (auth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  return fetch(apiUrl(endpoint), {
    ...fetchOptions,
    headers: requestHeaders,
  });
}
