import { useMutation } from "@tanstack/react-query"

import { apiBase, fetchJson } from "@/lib/api"

type ApplicationPayload = {
  listingId: string
  message?: string
}

export function useCreateApplication() {
  return useMutation({
    mutationFn: (payload: ApplicationPayload) =>
      fetchJson(`${apiBase}/applications`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  })
}
