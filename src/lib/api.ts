export const apiBase = import.meta.env.VITE_API_BASE ?? "/api"

type FetchOptions = {
  allow404?: boolean
  allow401?: boolean
}

export async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit,
  options?: FetchOptions,
) {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    if (response.status === 404 && options?.allow404) {
      return undefined as T
    }
    if (response.status === 401 && options?.allow401) {
      return undefined as T
    }
    const errorBody = await response.json().catch(() => ({}))
    const details =
      Array.isArray(errorBody?.details) && errorBody.details.length
        ? `: ${errorBody.details.join(", ")}`
        : ""
    const message =
      errorBody?.error ? `${errorBody.error}${details}` : `Request failed with ${response.status}`
    throw new Error(message)
  }

  return response.json() as Promise<T>
}
