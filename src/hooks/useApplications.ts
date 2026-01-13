import { useMutation } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"

type ApplicationPayload = {
  listingId: string
  message?: string
}

export function useCreateApplication() {
  return useMutation({
    mutationFn: async (payload: ApplicationPayload) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw userError ?? new Error("Not authenticated.")
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name,email,phone")
        .eq("id", userData.user.id)
        .maybeSingle()
      if (profileError || !profile) throw profileError ?? new Error("Profile not found.")
      const { error } = await supabase.from("applications").insert({
        listing_id: payload.listingId,
        applicant_id: userData.user.id,
        applicant_name: profile.name,
        applicant_email: profile.email,
        applicant_phone: profile.phone ?? null,
        message: payload.message ?? null,
      })
      if (error) throw error
    },
  })
}
