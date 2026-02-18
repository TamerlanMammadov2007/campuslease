import { Filter } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export type RoommateFiltersState = {
  minScore: number
  gender: string
  university: string
  maxBudget: number
  pets: string
  smoking: string
}

type RoommateFiltersProps = {
  value: RoommateFiltersState
  onChange: (value: RoommateFiltersState) => void
}

export function RoommateFilters({ value, onChange }: RoommateFiltersProps) {
  const activeFilters =
    [
      value.minScore > 0 ? "score" : "",
      value.gender,
      value.university,
      value.maxBudget < 2500 ? "budget" : "",
      value.pets,
      value.smoking,
    ].filter(Boolean).length || 0

  return (
    <Card className="border border-white/10 bg-white/5">
      <CardContent className="space-y-5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Filter size={16} />
            Match Filters
          </div>
          <Badge variant="amber">{activeFilters} Active</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs text-slate-300">Minimum Score</label>
            <input
              type="range"
              min={0}
              max={90}
              value={value.minScore}
              onChange={(event) =>
                onChange({ ...value, minScore: Number(event.target.value) })
              }
              className="w-full"
            />
            <p className="text-xs text-white">{value.minScore}%+</p>
          </div>
          <div>
            <label className="text-xs text-slate-300">Gender</label>
            <select
              className="h-11 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white"
              value={value.gender}
              onChange={(event) =>
                onChange({ ...value, gender: event.target.value })
              }
            >
              <option value="">Any</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-300">University</label>
            <Input
              placeholder="Search university"
              value={value.university}
              onChange={(event) =>
                onChange({ ...value, university: event.target.value })
              }
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs text-slate-300">Max Budget</label>
            <input
              type="range"
              min={800}
              max={2500}
              value={value.maxBudget}
              onChange={(event) =>
                onChange({ ...value, maxBudget: Number(event.target.value) })
              }
              className="w-full"
            />
            <p className="text-xs text-white">${value.maxBudget}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <Checkbox
              checked={value.pets === "Open to Pets"}
              onChange={(event) =>
                onChange({
                  ...value,
                  pets: event.target.checked ? "Open to Pets" : "",
                })
              }
            />
            Open to pets
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <Checkbox
              checked={value.smoking === "No"}
              onChange={(event) =>
                onChange({
                  ...value,
                  smoking: event.target.checked ? "No" : "",
                })
              }
            />
            Non-smoker
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
