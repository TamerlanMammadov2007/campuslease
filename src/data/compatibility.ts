import type { RoommateProfile } from "./types"

export function calculateCompatibility(
  currentUser: RoommateProfile,
  candidate: RoommateProfile,
) {
  let score = 0

  const addIfMatch = (value: string, weight: number) => {
    if (value) {
      score += weight
    }
  }

  addIfMatch(currentUser.sleepSchedule === candidate.sleepSchedule ? "yes" : "", 15)
  addIfMatch(currentUser.cleanliness === candidate.cleanliness ? "yes" : "", 15)
  addIfMatch(currentUser.noise === candidate.noise ? "yes" : "", 10)
  addIfMatch(currentUser.socialLevel === candidate.socialLevel ? "yes" : "", 10)
  addIfMatch(currentUser.studyHabits === candidate.studyHabits ? "yes" : "", 10)
  addIfMatch(currentUser.smoking === candidate.smoking ? "yes" : "", 10)
  addIfMatch(currentUser.pets === candidate.pets ? "yes" : "", 10)

  const sharedInterests = candidate.interests.filter((interest) =>
    currentUser.interests.includes(interest),
  )
  score += Math.min(sharedInterests.length * 3, 15)

  return Math.min(score, 100)
}
