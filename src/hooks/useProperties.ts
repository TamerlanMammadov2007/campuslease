import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Property } from "@/data/types"
import { supabase } from "@/lib/supabase"

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

const toListingPayload = (property: Property, ownerId: string, ownerName: string, ownerEmail: string, ownerPhone?: string) => ({
  title: property.title,
  address: property.address,
  city: property.city,
  price: property.price,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  square_feet: property.squareFeet,
  type: property.type,
  images: property.images,
  amenities: property.amenities,
  utilities_included: property.utilitiesIncluded,
  pets_allowed: property.petsAllowed,
  parking_available: property.parkingAvailable,
  furnished: property.furnished,
  available_from: property.availableFrom,
  available_until: property.availableUntil || null,
  owner_id: ownerId,
  owner_name: ownerName,
  owner_email: ownerEmail,
  owner_phone: ownerPhone ?? null,
  status: property.status,
  coordinates: property.coordinates,
  description: property.description,
})

export function useProperties() {
  return useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => mapListing(row as ListingRow))
    },
  })
}

export function useProperty(id?: string) {
  return useQuery<Property | undefined>({
    queryKey: ["property", id],
    queryFn: async () => {
      if (!id) return undefined
      const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle()
      if (error) throw error
      return data ? mapListing(data as ListingRow) : undefined
    },
    enabled: Boolean(id),
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (property: Property) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw userError ?? new Error("Not authenticated.")
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name,email,phone")
        .eq("id", userData.user.id)
        .maybeSingle()
      if (profileError || !profile) throw profileError ?? new Error("Profile not found.")
      const payload = toListingPayload(property, userData.user.id, profile.name, profile.email, profile.phone)
      const { data, error } = await supabase.from("listings").insert(payload).select("*").single()
      if (error) throw error
      return mapListing(data as ListingRow)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
    },
  })
}

export function useUpdateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (property: Property) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw userError ?? new Error("Not authenticated.")
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name,email,phone")
        .eq("id", userData.user.id)
        .maybeSingle()
      if (profileError || !profile) throw profileError ?? new Error("Profile not found.")
      const payload = toListingPayload(property, userData.user.id, profile.name, profile.email, profile.phone)
      const { data, error } = await supabase
        .from("listings")
        .update(payload)
        .eq("id", property.id)
        .select("*")
        .single()
      if (error) throw error
      return mapListing(data as ListingRow)
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
      queryClient.setQueryData(["property", updated.id], updated)
    },
  })
}

export function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("listings").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
    },
  })
}
