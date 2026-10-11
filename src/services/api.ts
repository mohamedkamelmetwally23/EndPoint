export const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api/v1").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    public fields: string[] = [],
  ) {
    super(code);
  }
}
async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
  envelope = false,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      method,
      credentials: "include",
      headers:
        body && !(body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {},
      ...(body
        ? { body: body instanceof FormData ? body : JSON.stringify(body) }
        : {}),
    },
  );
  const result = await response.json();
  if (!response.ok)
    throw new ApiError(
      result.error?.code || "INTERNAL_ERROR",
      response.status,
      (result.error?.fields || []).map((field: { path: string }) => field.path),
    );
  return (envelope ? result : result.data) as T;
}

// Share only in-flight reads; settled responses are never cached.
const pendingReads = new Map<string, Promise<unknown>>();
function read<T>(path: string, envelope = false): Promise<T> {
  const key = `${envelope ? "page:" : "data:"}${path}`;
  const existing = pendingReads.get(key);
  if (existing) return existing as Promise<T>;
  const pending = request<T>(path, "GET", undefined, envelope).finally(() => {
    if (pendingReads.get(key) === pending) pendingReads.delete(key);
  });
  pendingReads.set(key, pending);
  return pending;
}
export function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  if (method !== "GET" || body !== undefined) {
    pendingReads.clear();
    return request<T>(path, method, body);
  }
  return read<T>(path);
}

export type Pagination = { page: number; limit: number; total: number; hasNext: boolean };
export function apiPage<T>(path: string) {
  return read<{ data: T[]; pagination: Pagination }>(path, true);
}
