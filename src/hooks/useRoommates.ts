import { useQuery } from "@tanstack/react-query"

import { calculateCompatibility } from "@/data/compatibility"
import type { RoommateProfile } from "@/data/types"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"

type RoommateRow = {
  id: string
  user_id: string
  name: string
  age: number
  gender: string
  university: string
  major: string
  bio?: string | null
  photo?: string | null
  budget_min: number
  budget_max: number
  move_in_date: string
  preferred_locations: string[] | null
  sleep_schedule: string
  cleanliness: string
  noise: string
  guests: string
  smoking: string
  drinking: string
  pets: string
  study_habits: string
  social_level: string
  interests: string[] | null
}

const mapRoommate = (row: RoommateRow): RoommateProfile => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  age: row.age,
  gender: row.gender,
  university: row.university,
  major: row.major,
  bio: row.bio ?? "",
  photo: row.photo ?? undefined,
  budgetMin: row.budget_min,
  budgetMax: row.budget_max,
  moveInDate: row.move_in_date,
  preferredLocations: row.preferred_locations ?? [],
  sleepSchedule: row.sleep_schedule as RoommateProfile["sleepSchedule"],
  cleanliness: row.cleanliness as RoommateProfile["cleanliness"],
  noise: row.noise as RoommateProfile["noise"],
  guests: row.guests as RoommateProfile["guests"],
  smoking: row.smoking as RoommateProfile["smoking"],
  drinking: row.drinking as RoommateProfile["drinking"],
  pets: row.pets as RoommateProfile["pets"],
  studyHabits: row.study_habits as RoommateProfile["studyHabits"],
  socialLevel: row.social_level as RoommateProfile["socialLevel"],
  interests: row.interests ?? [],
})

export function useRoommates() {
  const { roommateProfile } = useApp()

  return useQuery<RoommateProfile[]>({
    queryKey: ["roommates", roommateProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("roommate_profiles").select("*")
      if (error) throw error
      const profiles = (data ?? []).map((row) => mapRoommate(row as RoommateRow))
      if (!roommateProfile) {
        return profiles
      }
      return profiles.map((profile) => ({
        ...profile,
        compatibilityScore: calculateCompatibility(roommateProfile, profile),
      }))
    },
  })
}
