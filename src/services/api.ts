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
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
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
  return result.data as T;
}
