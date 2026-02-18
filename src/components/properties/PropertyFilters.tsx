import { useState } from "react"
import {
  Filter,
  SlidersHorizontal,
  XCircle,
  Home,
  BedDouble,
  Bath,
  DollarSign,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type PropertyFiltersState = {
  query: string
  type: string
  bedrooms: string
  bathrooms: string
  minPrice: number
  maxPrice: number
  furnished: boolean
  pets: boolean
  parking: boolean
  amenities: string[]
}

type PropertyFiltersProps = {
  value: PropertyFiltersState
  onChange: (value: PropertyFiltersState) => void
}

const amenityOptions = [
  "Gym",
  "Pool",
  "Laundry",
  "Study Lounge",
  "Backyard",
  "Parking",
]

export function PropertyFilters({ value, onChange }: PropertyFiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const minRange = 500
  const maxRange = 3000

  const toggleAmenity = (amenity: string) => {
    onChange({
      ...value,
      amenities: value.amenities.includes(amenity)
        ? value.amenities.filter((item) => item !== amenity)
        : [...value.amenities, amenity],
    })
  }

  const activeFilters =
    [
      value.query,
      value.type,
      value.bedrooms,
      value.bathrooms,
      value.furnished ? "furnished" : "",
      value.pets ? "pets" : "",
      value.parking ? "parking" : "",
      value.amenities.length ? "amenities" : "",
    ].filter(Boolean).length || 0

  return (
    <Card className="border border-white/10 bg-white/5">
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Filter size={16} />
            Filters
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Badge variant="amber">{activeFilters} Active</Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onChange({
                  query: "",
                  type: "",
                  bedrooms: "",
                  bathrooms: "",
                  minPrice: 800,
                  maxPrice: 2500,
                  furnished: false,
                  pets: false,
                  parking: false,
                  amenities: [],
                })
              }
            >
              <XCircle size={14} />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-5 pt-1">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by city or address"
              value={value.query}
              onChange={(event) =>
                onChange({ ...value, query: event.target.value })
              }
            />
          </div>
          <div className="relative">
            <Home size={14} className="absolute left-3 top-3 text-slate-400" />
            <select
              className="h-11 w-full rounded-2xl border border-white/15 bg-white/10 pl-9 pr-4 text-sm text-white"
              value={value.type}
              onChange={(event) =>
                onChange({ ...value, type: event.target.value })
              }
            >
              <option value="">Property Type</option>
              <option value="Apartment">Apartment</option>
              <option value="Loft">Loft</option>
              <option value="Duplex">Duplex</option>
              <option value="House">House</option>
              <option value="Studio">Studio</option>
              <option value="Townhome">Townhome</option>
              <option value="Condo">Condo</option>
            </select>
          </div>
          <div className="relative">
            <BedDouble
              size={14}
              className="absolute left-3 top-3 text-slate-400"
            />
            <select
              className="h-11 w-full rounded-2xl border border-white/15 bg-white/10 pl-9 pr-4 text-sm text-white"
              value={value.bedrooms}
              onChange={(event) =>
                onChange({ ...value, bedrooms: event.target.value })
              }
            >
              <option value="">Bedrooms</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </div>
          <div className="relative">
            <Bath size={14} className="absolute left-3 top-3 text-slate-400" />
            <select
              className="h-11 w-full rounded-2xl border border-white/15 bg-white/10 pl-9 pr-4 text-sm text-white"
              value={value.bathrooms}
              onChange={(event) =>
                onChange({ ...value, bathrooms: event.target.value })
              }
            >
              <option value="">Bathrooms</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <DollarSign size={14} />
            Monthly Price
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>${value.minPrice}</span>
            <span>${value.maxPrice}</span>
          </div>
          <div className="relative mt-4 h-10">
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-orange-400 to-amber-300"
              style={{
                left: `${((value.minPrice - minRange) / (maxRange - minRange)) * 100}%`,
                right: `${100 - ((value.maxPrice - minRange) / (maxRange - minRange)) * 100}%`,
              }}
            />
            <input
              type="range"
              min={minRange}
              max={maxRange}
              value={value.minPrice}
              onChange={(event) => {
                const next = Math.min(
                  Number(event.target.value),
                  value.maxPrice,
                )
                onChange({ ...value, minPrice: next })
              }}
              className="absolute inset-0 z-20 w-full appearance-none bg-transparent"
            />
            <input
              type="range"
              min={minRange}
              max={maxRange}
              value={value.maxPrice}
              onChange={(event) => {
                const next = Math.max(
                  Number(event.target.value),
                  value.minPrice,
                )
                onChange({ ...value, maxPrice: next })
              }}
              className="absolute inset-0 z-30 w-full appearance-none bg-transparent"
            />
          </div>
        </div>

        <button
          className="flex items-center gap-2 text-sm text-orange-200"
          onClick={() => setAdvancedOpen((prev) => !prev)}
        >
          <SlidersHorizontal size={16} />
          Advanced Filters
        </button>

      {advancedOpen ? (
          <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <Checkbox
                checked={value.furnished}
                onChange={(event) =>
                  onChange({ ...value, furnished: event.target.checked })
                }
              />
              Furnished
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <Checkbox
                checked={value.pets}
                onChange={(event) =>
                  onChange({ ...value, pets: event.target.checked })
                }
              />
              Pet Friendly
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <Checkbox
                checked={value.parking}
                onChange={(event) =>
                  onChange({ ...value, parking: event.target.checked })
                }
              />
              Parking
            </label>
            <div className="md:col-span-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                Amenities
              </p>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={cn(
                      "rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 transition",
                      value.amenities.includes(amenity) &&
                        "border-orange-400/60 bg-orange-400/10 text-orange-200",
                    )}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
