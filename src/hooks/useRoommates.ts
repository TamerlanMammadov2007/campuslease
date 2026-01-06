import { useQuery } from "@tanstack/react-query"

import { calculateCompatibility } from "@/data/compatibility"
import { roommates as mockRoommates } from "@/data/mock"
import type { RoommateProfile } from "@/data/types"
import { useApp } from "@/context/AppContext"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useRoommates() {
  const { roommateProfile } = useApp()

  return useQuery<RoommateProfile[]>({
    queryKey: ["roommates", roommateProfile?.id],
    queryFn: async () => {
      await delay(200)
      if (!roommateProfile) {
        return mockRoommates
      }
      return mockRoommates.map((profile) => ({
        ...profile,
        compatibilityScore: calculateCompatibility(roommateProfile, profile),
      }))
    },
  })
}
