import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { SectionHeader } from "@/components/SectionHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRoommates } from "@/hooks/useRoommates"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/context/AppContext"
import { useCreateThread } from "@/hooks/useThreads"

export function RoommateProfileView() {
  const { id } = useParams()
  const { data: profiles = [] } = useRoommates()
  const { isAuthenticated } = useApp()
  const { mutateAsync: createThread } = useCreateThread()
  const navigate = useNavigate()
  const profile = profiles.find((item) => item.id === id)

  if (!profile) {
    return (
      <Card>
        <CardContent className="text-white">Roommate not found.</CardContent>
      </Card>
    )
  }

  const handleMessage = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to message roommates.")
      navigate("/login")
      return
    }
    try {
      await createThread({
        participantName: profile.name,
        participantEmail: `${profile.name.toLowerCase().replace(" ", ".")}@campuslease.com`,
        message: `Hi ${profile.name}, I'd love to chat about housing options.`,
      })
      toast.success("Message sent. Check your inbox for replies.")
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message."
      toast.error(errorMessage)
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Roommate Profile"
        title={profile.name}
        subtitle={`${profile.university} · ${profile.major}`}
      />
      <Card className="border border-white/10 bg-white/10">
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-3xl bg-white/10">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-xl font-semibold text-white">
                  {profile.name}
                </p>
                <p className="text-sm text-slate-300">
                  {profile.age} · {profile.gender}
                </p>
              </div>
            </div>
            <Button onClick={handleMessage}>Send Message</Button>
          </div>

          <p className="text-sm text-slate-200">{profile.bio}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
                Housing Preferences
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li>Budget: ${profile.budgetMin} - ${profile.budgetMax}</li>
                <li>Move-in Date: {profile.moveInDate}</li>
                <li>Locations: {profile.preferredLocations.join(", ")}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
                Lifestyle
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li>Sleep: {profile.sleepSchedule}</li>
                <li>Cleanliness: {profile.cleanliness}</li>
                <li>Noise: {profile.noise}</li>
                <li>Guests: {profile.guests}</li>
                <li>Smoking: {profile.smoking}</li>
                <li>Drinking: {profile.drinking}</li>
                <li>Pets: {profile.pets}</li>
                <li>Study: {profile.studyHabits}</li>
                <li>Social: {profile.socialLevel}</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
              Interests
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <Badge key={interest} variant="slate">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
