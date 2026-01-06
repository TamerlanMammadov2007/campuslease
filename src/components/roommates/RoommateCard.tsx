import { Calendar, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { RoommateProfile } from "@/data/types"

type RoommateCardProps = {
  profile: RoommateProfile
}

const scoreVariant = (score?: number) => {
  if (score === undefined) return "default"
  if (score < 50) return "red"
  if (score < 75) return "yellow"
  return "green"
}

export function RoommateCard({ profile }: RoommateCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white/10">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <Link
              to={`/roommates/${profile.id}`}
              className="text-lg font-semibold text-white hover:text-orange-200"
            >
              {profile.name}
            </Link>
            <p className="text-xs text-slate-300">
              {profile.age} · {profile.gender}
            </p>
          </div>
          {profile.compatibilityScore !== undefined ? (
            <Badge variant={scoreVariant(profile.compatibilityScore)}>
              {profile.compatibilityScore}% Match
            </Badge>
          ) : null}
        </div>
        <div className="text-sm text-slate-200">
          <p className="font-semibold">{profile.university}</p>
          <p className="text-xs text-slate-300">{profile.major}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {profile.preferredLocations[0]}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            Move in {profile.moveInDate}
          </span>
          <span className="text-orange-200">
            ${profile.budgetMin} - ${profile.budgetMax}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.interests.slice(0, 3).map((interest) => (
            <Badge key={interest} variant="slate">
              {interest}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
