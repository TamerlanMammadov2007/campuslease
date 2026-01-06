import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiBase, fetchJson } from "@/lib/api"
import type { MessageThread, Property } from "@/data/types"

type AdminStats = {
  users: number
  listings: number
  applications: number
  threads: number
  messages: number
}

type AdminUser = {
  id: number
  name: string
  email: string
  created_at: string
}

type AdminApplication = {
  id: number
  listing_id: number
  listing_title?: string
  name: string
  email: string
  phone?: string
  message?: string
  applicant_user_id?: number
  created_at: string
}

type AdminLoginEvent = {
  id: number
  user_id?: number
  email: string
  event_type: string
  created_at: string
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => fetchJson<AdminStats>(`${apiBase}/admin/stats`),
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fetchJson<AdminUser[]>(`${apiBase}/admin/users`),
  })
}

export function useAdminListings() {
  return useQuery({
    queryKey: ["admin", "listings"],
    queryFn: () => fetchJson<Property[]>(`${apiBase}/admin/listings`),
  })
}

export function useAdminApplications() {
  return useQuery({
    queryKey: ["admin", "applications"],
    queryFn: () => fetchJson<AdminApplication[]>(`${apiBase}/admin/applications`),
  })
}

export function useAdminThreads() {
  return useQuery({
    queryKey: ["admin", "threads"],
    queryFn: () => fetchJson<MessageThread[]>(`${apiBase}/admin/threads`),
  })
}

export function useAdminLoginEvents() {
  return useQuery({
    queryKey: ["admin", "login-events"],
    queryFn: () => fetchJson<AdminLoginEvent[]>(`${apiBase}/admin/login-events`),
  })
}

export function useAdminUpdateListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string; data: Partial<Property> }) =>
      fetchJson<Property>(`${apiBase}/admin/listings/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload.data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] })
    },
  })
}

export function useAdminDeleteListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`${apiBase}/admin/listings/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then((res) => {
        if (!res.ok && res.status !== 204) {
          throw new Error("Failed to delete listing")
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] })
    },
  })
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: number; data: { name: string; email: string; password?: string } }) =>
      fetchJson(`${apiBase}/admin/users/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload.data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}
