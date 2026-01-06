import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Property } from "@/data/types"
import { apiBase, fetchJson } from "@/lib/api"

export function useProperties() {
  return useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: () => fetchJson<Property[]>(`${apiBase}/listings`),
  })
}

export function useProperty(id?: string) {
  return useQuery<Property | undefined>({
    queryKey: ["property", id],
    queryFn: () =>
      fetchJson<Property | undefined>(`${apiBase}/listings/${id}`, undefined, {
        allow404: true,
      }),
    enabled: Boolean(id),
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (property: Property) =>
      fetchJson<Property>(`${apiBase}/listings`, {
        method: "POST",
        body: JSON.stringify(property),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
    },
  })
}

export function useUpdateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (property: Property) =>
      fetchJson<Property>(`${apiBase}/listings/${property.id}`, {
        method: "PUT",
        body: JSON.stringify(property),
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
      queryClient.setQueryData(["property", updated.id], updated)
    },
  })
}

export function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetch(`${apiBase}/listings/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then((res) => {
        if (!res.ok && res.status !== 204) {
          throw new Error("Failed to delete listing")
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
    },
  })
}
