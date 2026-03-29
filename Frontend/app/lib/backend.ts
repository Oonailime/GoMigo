export const clientBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api";

export const serverBackendUrl =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:3001/api";

type BackendRequestOptions = Omit<RequestInit, "headers"> & {
  token?: string;
  headers?: HeadersInit;
  json?: unknown;
};

export function getBackendAuthHeaders(token: string, headers?: HeadersInit): HeadersInit {
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchBackend(
  path: string,
  options: BackendRequestOptions = {},
) {
  const { token, headers, json, ...init } = options;

  return fetch(`${clientBackendUrl}${path}`, {
    ...init,
    headers: token ? getBackendAuthHeaders(token, headers) : headers,
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });
}

export async function fetchBackendJson<T>(
  path: string,
  options: BackendRequestOptions = {},
) {
  const response = await fetchBackend(path, options);
  const data = (await response.json().catch(() => null)) as T | null;

  return { response, data };
}

export async function fetchServerBackend(
  path: string,
  options: BackendRequestOptions = {},
) {
  const { token, headers, json, ...init } = options;

  return fetch(`${serverBackendUrl}${path}`, {
    ...init,
    headers: token ? getBackendAuthHeaders(token, headers) : headers,
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });
}

export async function fetchServerBackendJson<T>(
  path: string,
  options: BackendRequestOptions = {},
) {
  const response = await fetchServerBackend(path, options);
  const data = (await response.json().catch(() => null)) as T | null;

  return { response, data };
}

export async function readApiErrorMessage(
  response: Response,
  fallback: string,
) {
  const data = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | null;

  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  return data?.message ?? fallback;
}
