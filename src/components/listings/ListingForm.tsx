import React from "react"
import { MapPin, Plus, UploadCloud, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { Property } from "@/data/types"
import { supabase } from "@/lib/supabase"

type ListingFormProps = {
  initial: Property
  onSubmit: (property: Property) => void
  submitLabel: string
}

const amenitySuggestions = [
  "Gym",
  "Pool",
  "Laundry",
  "Study Lounge",
  "Parking",
  "Rooftop",
  "Backyard",
  "Pet Friendly",
  "Furnished",
]

const propertyTypes: Property["type"][] = [
  "Apartment",
  "House",
  "Studio",
  "Townhome",
]

export function ListingForm({ initial, onSubmit, submitLabel }: ListingFormProps) {
  const [draft, setDraft] = React.useState<Property>(initial)
  const [amenityInput, setAmenityInput] = React.useState("")
  const [imageInput, setImageInput] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)

  const addAmenity = (value?: string) => {
    const next = (value ?? amenityInput).trim()
    if (!next) return
    setDraft((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(next) ? prev.amenities : [...prev.amenities, next],
    }))
    setAmenityInput("")
  }

  const addImage = (url?: string) => {
    const next = (url ?? imageInput).trim()
    if (!next) return
    setDraft((prev) => ({
      ...prev,
      images: [...prev.images, next],
    }))
    setImageInput("")
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    if (!draft.ownerId) {
      toast.error("Please sign in to upload photos.")
      event.target.value = ""
      return
    }
    setIsUploading(true)
    try {
      const urls = await Promise.all(
        Array.from(files).map(async (file) => {
          const safeName = file.name.replace(/\s+/g, "-")
          const path = `${draft.ownerId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`
          const { error } = await supabase.storage.from("listing-images").upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          })
          if (error) throw error
          const { data } = supabase.storage.from("listing-images").getPublicUrl(path)
          return data.publicUrl
        }),
      )
      setDraft((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
      }))
      toast.success("Photos uploaded.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload images."
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
    event.target.value = ""
  }

  const removeAmenity = (amenity: string) => {
    setDraft((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((item) => item !== amenity),
    }))
  }

  const removeImage = (url: string) => {
    setDraft((prev) => ({
      ...prev,
      images: prev.images.filter((item) => item !== url),
    }))
  }

  return (
    <Card className="border border-white/10 bg-white/10">
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">
            Listing Basics
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-slate-300">Listing title</label>
              <Input
                placeholder="Skyline Lofts at Crescent Ave"
                value={draft.title}
                onChange={(event) =>
                  setDraft({ ...draft, title: event.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-300">Monthly rent</label>
              <Input
                type="number"
                min={0}
                step={50}
                placeholder="1650"
                value={draft.price}
                onChange={(event) =>
                  setDraft({ ...draft, price: Number(event.target.value) })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-300">Property type</label>
              <select
                className="h-11 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white"
                value={draft.type}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    type: event.target.value as Property["type"],
                  })
                }
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-300">Description</label>
              <Textarea
                placeholder="Share what makes this space perfect for students."
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">
            Location Details
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-300">Street address</label>
              <Input
                placeholder="120 Crescent Ave"
                value={draft.address}
                onChange={(event) =>
                  setDraft({ ...draft, address: event.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-300">City</label>
              <Input
                placeholder="Austin"
                value={draft.city}
                onChange={(event) => setDraft({ ...draft, city: event.target.value })}
              />
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-orange-200" />
                Map view uses coordinates.
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Latitude"
                  value={draft.coordinates.lat}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      coordinates: {
                        ...draft.coordinates,
                        lat: Number(event.target.value),
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Longitude"
                  value={draft.coordinates.lng}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      coordinates: {
                        ...draft.coordinates,
                        lng: Number(event.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">
            Property Specs
          </p>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs text-slate-300">Bedrooms</label>
              <Input
                type="number"
                min={0}
                value={draft.bedrooms}
                onChange={(event) =>
                  setDraft({ ...draft, bedrooms: Number(event.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-300">Bathrooms</label>
              <Input
                type="number"
                min={0}
                value={draft.bathrooms}
                onChange={(event) =>
                  setDraft({ ...draft, bathrooms: Number(event.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-300">Square feet</label>
              <Input
                type="number"
                min={0}
                value={draft.squareFeet}
                onChange={(event) =>
                  setDraft({ ...draft, squareFeet: Number(event.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-300">Available from</label>
              <Input
                type="date"
                value={draft.availableFrom}
                onChange={(event) =>
                  setDraft({ ...draft, availableFrom: event.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-300">Available until</label>
              <Input
                type="date"
                value={draft.availableUntil ?? ""}
                onChange={(event) =>
                  setDraft({ ...draft, availableUntil: event.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">
            Features
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <Checkbox
                checked={draft.utilitiesIncluded}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    utilitiesIncluded: event.target.checked,
                  })
                }
              />
              Utilities included
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <Checkbox
                checked={draft.petsAllowed}
                onChange={(event) =>
                  setDraft({ ...draft, petsAllowed: event.target.checked })
                }
              />
              Pet friendly
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <Checkbox
                checked={draft.parkingAvailable}
                onChange={(event) =>
                  setDraft({ ...draft, parkingAvailable: event.target.checked })
                }
              />
              Parking available
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <Checkbox
                checked={draft.furnished}
                onChange={(event) =>
                  setDraft({ ...draft, furnished: event.target.checked })
                }
              />
              Furnished
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">
            Amenities
          </p>
          <div className="flex flex-wrap gap-2">
            {amenitySuggestions.map((amenity) => (
              <button
                key={amenity}
                onClick={() => addAmenity(amenity)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:border-orange-400/60 hover:text-orange-200"
              >
                {amenity}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {draft.amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 px-3 py-1 text-xs text-orange-200"
              >
                {amenity}
                <button onClick={() => removeAmenity(amenity)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Add custom amenity"
              value={amenityInput}
              onChange={(event) => setAmenityInput(event.target.value)}
            />
            <Button variant="outline" onClick={() => addAmenity()}>
              <Plus size={14} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">
            Photos
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 text-xs text-slate-300">
              <UploadCloud size={18} />
              {isUploading ? "Uploading photos..." : "Drop photos or click to upload"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <Input
                placeholder="Paste image URL"
                value={imageInput}
                onChange={(event) => setImageInput(event.target.value)}
              />
              <Button variant="outline" onClick={() => addImage()}>
                Add Image URL
              </Button>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {draft.images.map((image) => (
              <div
                key={image}
                className="relative overflow-hidden rounded-2xl border border-white/10"
              >
                <img
                  src={image}
                  alt="Property"
                  className="h-32 w-full object-cover"
                />
                <button
                  onClick={() => removeImage(image)}
                  className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1 text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">
            Contact Information
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs text-slate-300">Contact name</label>
              <Input
                placeholder="Jordan Parker"
                value={draft.owner.name}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    owner: { ...draft.owner, name: event.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-300">Contact email</label>
              <Input
                type="email"
                placeholder="you@email.com"
                value={draft.owner.email}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    owner: { ...draft.owner, email: event.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-300">Contact phone</label>
              <Input
                placeholder="(555) 000-0000"
                value={draft.owner.phone}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    owner: { ...draft.owner, phone: event.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>

        <Button onClick={() => onSubmit(draft)}>{submitLabel}</Button>
      </CardContent>
    </Card>
  )
}
