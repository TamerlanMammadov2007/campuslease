import React from "react"
import { motion } from "framer-motion"
import { Camera, Sparkles } from "lucide-react"

import { SectionHeader } from "@/components/SectionHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RoommateFilters } from "@/components/roommates/RoommateFilters"
import type { RoommateFiltersState } from "@/components/roommates/RoommateFilters"
import { RoommateCard } from "@/components/roommates/RoommateCard"
import { useRoommates } from "@/hooks/useRoommates"
import type { RoommateProfile } from "@/data/types"
import { useApp } from "@/context/AppContext"
import { toast } from "sonner"

const interestOptions = [
  "Sports",
  "Music",
  "Gaming",
  "Cooking",
  "Fitness",
  "Travel",
  "Photography",
  "Reading",
  "Art",
  "Coffee",
  "Tech",
  "Fashion",
  "Movies",
  "Outdoors",
  "Journaling",
]

const defaultFilters: RoommateFiltersState = {
  minScore: 0,
  gender: "",
  university: "",
  maxBudget: 2500,
  pets: "",
  smoking: "",
}

const defaultProfile: RoommateProfile = {
  id: "current-user",
  name: "",
  age: 0,
  gender: "",
  university: "",
  major: "",
  bio: "",
  budgetMin: 0,
  budgetMax: 0,
  moveInDate: "",
  preferredLocations: [],
  sleepSchedule: "",
  cleanliness: "",
  noise: "",
  guests: "",
  smoking: "",
  drinking: "",
  pets: "",
  studyHabits: "",
  socialLevel: "",
  interests: [],
}

export function Roommates() {
  const { roommateProfile, setRoommateProfile, isAuthenticated } = useApp()
  const [draft, setDraft] = React.useState<RoommateProfile>(
    roommateProfile ?? defaultProfile,
  )
  const [filters, setFilters] = React.useState(defaultFilters)
  const { data: profiles = [] } = useRoommates()
  const [locationInput, setLocationInput] = React.useState("")

  React.useEffect(() => {
    setDraft(roommateProfile ?? defaultProfile)
  }, [roommateProfile])

  const filtered = profiles
    .filter((profile) =>
      filters.gender ? profile.gender === filters.gender : true,
    )
    .filter((profile) =>
      filters.university
        ? profile.university.toLowerCase().includes(filters.university.toLowerCase())
        : true,
    )
    .filter((profile) =>
      profile.budgetMax <= filters.maxBudget,
    )
    .filter((profile) =>
      filters.pets ? profile.pets === filters.pets : true,
    )
    .filter((profile) =>
      filters.smoking ? profile.smoking === filters.smoking : true,
    )
    .filter((profile) =>
      filters.minScore && profile.compatibilityScore !== undefined
        ? profile.compatibilityScore >= filters.minScore
        : true,
    )
    .sort((a, b) => (b.compatibilityScore ?? 0) - (a.compatibilityScore ?? 0))

  const handleAddLocation = () => {
    if (!locationInput.trim()) return
    setDraft((prev) => ({
      ...prev,
      preferredLocations: [...prev.preferredLocations, locationInput.trim()],
    }))
    setLocationInput("")
  }

  const toggleInterest = (interest: string) => {
    setDraft((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((item) => item !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSaveProfile = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to save your roommate profile.")
      return
    }
    try {
      await setRoommateProfile(draft)
      toast.success("Roommate profile saved.")
    } catch {
      toast.error("Failed to save roommate profile.")
    }
  }

  if (!roommateProfile) {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Roommate Matching"
          title="Create Your Roommate Profile"
          subtitle="Tell us about your lifestyle and housing preferences to unlock AI-powered matches."
        />
        <Card className="border border-white/10 bg-white/10">
          <CardContent className="space-y-6 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3 text-white">
                <Sparkles size={18} />
                Complete your profile to get started.
              </div>
              <Button onClick={handleSaveProfile}>Save Profile</Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <Input
                  placeholder="Name"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
                <Input
                  placeholder="Age"
                  value={draft.age || ""}
                  onChange={(event) =>
                    setDraft({ ...draft, age: Number(event.target.value) || 0 })
                  }
                />
                <Input
                  placeholder="Gender"
                  value={draft.gender}
                  onChange={(event) =>
                    setDraft({ ...draft, gender: event.target.value })
                  }
                />
                <Input
                  placeholder="University"
                  value={draft.university}
                  onChange={(event) =>
                    setDraft({ ...draft, university: event.target.value })
                  }
                />
                <Input
                  placeholder="Major"
                  value={draft.major}
                  onChange={(event) =>
                    setDraft({ ...draft, major: event.target.value })
                  }
                />
                <Textarea
                  placeholder="Short bio"
                  value={draft.bio}
                  onChange={(event) =>
                    setDraft({ ...draft, bio: event.target.value })
                  }
                />
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-slate-300">
                  <Camera className="mx-auto mb-2" />
                  Upload profile photo
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Budget min"
                    value={draft.budgetMin || ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        budgetMin: Number(event.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    placeholder="Budget max"
                    value={draft.budgetMax || ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        budgetMax: Number(event.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Input
                  placeholder="Move-in date"
                  value={draft.moveInDate}
                  onChange={(event) =>
                    setDraft({ ...draft, moveInDate: event.target.value })
                  }
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Preferred location"
                    value={locationInput}
                    onChange={(event) => setLocationInput(event.target.value)}
                  />
                  <Button variant="outline" onClick={handleAddLocation}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {draft.preferredLocations.map((location) => (
                    <span
                      key={location}
                      className="rounded-full border border-orange-400/40 px-3 py-1 text-xs text-orange-200"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <select
                className="h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white"
                value={draft.sleepSchedule}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    sleepSchedule: event.target.value as RoommateProfile["sleepSchedule"],
                  })
                }
              >
                <option value="">Sleep schedule</option>
                <option value="Early Bird">Early Bird</option>
                <option value="Night Owl">Night Owl</option>
                <option value="Flexible">Flexible</option>
              </select>
              <select
                className="h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white"
                value={draft.cleanliness}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    cleanliness: event.target.value as RoommateProfile["cleanliness"],
                  })
                }
              >
                <option value="">Cleanliness</option>
                <option value="Very Clean">Very Clean</option>
                <option value="Moderately Clean">Moderately Clean</option>
                <option value="Relaxed">Relaxed</option>
              </select>
              <select
                className="h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white"
                value={draft.noise}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    noise: event.target.value as RoommateProfile["noise"],
                  })
                }
              >
                <option value="">Noise level</option>
                <option value="Quiet">Quiet</option>
                <option value="Moderate">Moderate</option>
                <option value="Lively">Lively</option>
              </select>
              <select
                className="h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white"
                value={draft.guests}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    guests: event.target.value as RoommateProfile["guests"],
                  })
                }
              >
                <option value="">Guests</option>
                <option value="Rarely">Rarely</option>
                <option value="Sometimes">Sometimes</option>
                <option value="Often">Often</option>
              </select>
              <select
                className="h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white"
                value={draft.drinking}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    drinking: event.target.value as RoommateProfile["drinking"],
                  })
                }
              >
                <option value="">Drinking</option>
                <option value="No">No drinking</option>
                <option value="Sometimes">Social drinker</option>
                <option value="Yes">Regular drinker</option>
              </select>
              <select
                className="h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white"
                value={draft.smoking}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    smoking: event.target.value as RoommateProfile["smoking"],
                  })
                }
              >
                <option value="">Smoking</option>
                <option value="No">Non-smoker</option>
                <option value="Yes">Smokes</option>
              </select>
              <select
                className="h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white"
                value={draft.pets}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    pets: event.target.value as RoommateProfile["pets"],
                  })
                }
              >
                <option value="">Pets</option>
                <option value="No Pets">No Pets</option>
                <option value="Has Pets">Has Pets</option>
                <option value="Open to Pets">Open to Pets</option>
              </select>
              <select
                className="h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white"
                value={draft.studyHabits}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    studyHabits:
                      event.target.value as RoommateProfile["studyHabits"],
                  })
                }
              >
                <option value="">Study habits</option>
                <option value="Focused">Focused</option>
                <option value="Balanced">Balanced</option>
                <option value="Flexible">Flexible</option>
              </select>
              <select
                className="h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white"
                value={draft.socialLevel}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    socialLevel:
                      event.target.value as RoommateProfile["socialLevel"],
                  })
                }
              >
                <option value="">Social level</option>
                <option value="Low-key">Low-key</option>
                <option value="Social">Social</option>
                <option value="Very Social">Very Social</option>
              </select>
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-300">
                Interests
              </p>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      draft.interests.includes(interest)
                        ? "border-orange-400/60 bg-orange-400/10 text-orange-200"
                        : "border-white/10 text-slate-200"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Roommate Matching"
        title="AI-Powered Compatibility Matches"
        subtitle="Filter the best roommates for your lifestyle, budget, and campus."
      />
      <RoommateFilters value={filters} onChange={setFilters} />
      <motion.div
        layout
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        {filtered.map((profile) => (
          <motion.div
            key={profile.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RoommateCard profile={profile} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
