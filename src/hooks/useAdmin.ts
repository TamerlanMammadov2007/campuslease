import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { MessageThread, Property } from "@/data/types"
import { supabase } from "@/lib/supabase"

type AdminStats = {
  users: number
  listings: number
  applications: number
  threads: number
  messages: number
}

type AdminUser = {
  id: string
  name: string
  email: string
  created_at: string
}

type AdminApplication = {
  id: string
  listing_id: string
  listing_title?: string
  name: string
  email: string
  phone?: string
  message?: string
  applicant_user_id?: string
  created_at: string
}

type AdminLoginEvent = {
  id: string
  user_id?: string
  email: string
  event_type: string
  created_at: string
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async (): Promise<AdminStats> => {
      const [
        users,
        listings,
        applications,
        threads,
        messages,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }),
        supabase.from("threads").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
      ])

      if (users.error) throw users.error
      if (listings.error) throw listings.error
      if (applications.error) throw applications.error
      if (threads.error) throw threads.error
      if (messages.error) throw messages.error

      return {
        users: users.count ?? 0,
        listings: listings.count ?? 0,
        applications: applications.count ?? 0,
        threads: threads.count ?? 0,
        messages: messages.count ?? 0,
      }
    },
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,name,email,created_at")
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []) as AdminUser[]
    },
  })
}

export function useAdminListings() {
  return useQuery({
    queryKey: ["admin", "listings"],
    queryFn: async (): Promise<Property[]> => {
      const { data, error } = await supabase.from("listings").select("*")
      if (error) throw error
      return (data ?? []).map((row) => mapListing(row as ListingRow))
    },
  })
}

export function useAdminApplications() {
  return useQuery({
    queryKey: ["admin", "applications"],
    queryFn: async (): Promise<AdminApplication[]> => {
      const { data, error } = await supabase
        .from("applications")
        .select("id,listing_id,applicant_name,applicant_email,applicant_phone,message,created_at,listings(title)")
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        listing_id: row.listing_id,
        listing_title: row.listings?.title,
        name: row.applicant_name,
        email: row.applicant_email,
        phone: row.applicant_phone ?? undefined,
        message: row.message ?? undefined,
        applicant_user_id: undefined,
        created_at: row.created_at,
      }))
    },
  })
}

export function useAdminThreads() {
  return useQuery({
    queryKey: ["admin", "threads"],
    queryFn: async (): Promise<MessageThread[]> => {
      const { data, error } = await supabase
        .from("threads")
        .select("id,property_id,property_title,user_a_name,user_b_name")
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        propertyId: row.property_id ?? undefined,
        propertyTitle: row.property_title ?? undefined,
        participantName: `${row.user_a_name} & ${row.user_b_name}`,
        participantEmail: "",
        messages: [],
      }))
    },
  })
}

export function useAdminLoginEvents() {
  return useQuery({
    queryKey: ["admin", "login-events"],
    queryFn: async (): Promise<AdminLoginEvent[]> => {
      const { data, error } = await supabase
        .from("admin_login_events")
        .select("id,user_id,email,event_type,created_at")
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []) as AdminLoginEvent[]
    },
  })
}

export function useAdminUpdateListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: string; data: Partial<Property> }) => {
      const { data, error } = await supabase
        .from("listings")
        .update({
          title: payload.data.title,
          city: payload.data.city,
          price: payload.data.price,
          status: payload.data.status,
        })
        .eq("id", payload.id)
        .select("*")
        .single()
      if (error) throw error
      return mapListing(data as ListingRow)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] })
    },
  })
}

export function useAdminDeleteListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("listings").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] })
    },
  })
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: string; data: { name: string } }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ name: payload.data.name })
        .eq("id", payload.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

type ListingRow = {
  id: string
  title: string
  address: string
  city: string
  price: number
  bedrooms: number
  bathrooms: number
  square_feet: number
  type: Property["type"]
  images: string[] | null
  amenities: string[] | null
  utilities_included: boolean
  pets_allowed: boolean
  parking_available: boolean
  furnished: boolean
  available_from: string
  available_until?: string | null
  owner_id: string
  owner_name: string
  owner_email: string
  owner_phone?: string | null
  status: Property["status"]
  coordinates?: { lat: number; lng: number } | null
  description?: string | null
  created_at: string
}

const mapListing = (row: ListingRow): Property => ({
  id: row.id,
  title: row.title,
  address: row.address,
  city: row.city,
  price: row.price,
  bedrooms: row.bedrooms,
  bathrooms: row.bathrooms,
  squareFeet: row.square_feet,
  type: row.type,
  images: row.images ?? [],
  amenities: row.amenities ?? [],
  utilitiesIncluded: row.utilities_included,
  petsAllowed: row.pets_allowed,
  parkingAvailable: row.parking_available,
  furnished: row.furnished,
  availableFrom: row.available_from,
  availableUntil: row.available_until ?? undefined,
  owner: {
    name: row.owner_name,
    email: row.owner_email,
    phone: row.owner_phone ?? "",
  },
  ownerId: row.owner_id,
  status: row.status,
  coordinates: row.coordinates ?? { lat: 0, lng: 0 },
  description: row.description ?? "",
  createdDate: row.created_at,
})
