import React from "react"
import { toast } from "sonner"

import { SectionHeader } from "@/components/SectionHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"

type ProfileState = {
  name: string
  email: string
  phone: string
  bio: string
  university: string
  gradYear: string
  leaseDuration: string
  moveInDate: string
  propertyTypes: string[]
  preferredCities: string[]
  parking: boolean
  budgetMin: number
  budgetMax: number
  hasPets: boolean
  petType: string
}

const defaultProfile: ProfileState = {
  name: "",
  email: "",
  phone: "",
  bio: "",
  university: "",
  gradYear: "",
  leaseDuration: "12 months",
  moveInDate: "",
  propertyTypes: [],
  preferredCities: [],
  parking: false,
  budgetMin: 900,
  budgetMax: 1800,
  hasPets: false,
  petType: "",
}

const propertyTypeOptions = ["Apartment", "House", "Studio", "Townhome"]

export function Profile() {
  const { currentUserEmail, currentUserName, currentUserId } = useApp()
  const [profile, setProfile] = React.useState<ProfileState>(defaultProfile)
  const [cityInput, setCityInput] = React.useState("")

  React.useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: currentUserName,
      email: currentUserEmail,
    }))
  }, [currentUserEmail, currentUserName])

  React.useEffect(() => {
    const loadProfile = async () => {
      if (!currentUserId) return
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "phone,bio,university,grad_year,lease_duration,move_in_date,property_types,preferred_cities,parking,budget_min,budget_max,has_pets,pet_type",
        )
        .eq("id", currentUserId)
        .maybeSingle()
      if (error || !data) return
      setProfile((prev) => ({
        ...prev,
        phone: data.phone ?? "",
        bio: data.bio ?? "",
        university: data.university ?? "",
        gradYear: data.grad_year ?? "",
        leaseDuration: data.lease_duration ?? "12 months",
        moveInDate: data.move_in_date ?? "",
        propertyTypes: data.property_types ?? [],
        preferredCities: data.preferred_cities ?? [],
        parking: data.parking ?? false,
        budgetMin: data.budget_min ?? 900,
        budgetMax: data.budget_max ?? 1800,
        hasPets: data.has_pets ?? false,
        petType: data.pet_type ?? "",
      }))
    }
    void loadProfile()
  }, [currentUserId])

  const togglePropertyType = (type: string) => {
    setProfile((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter((item) => item !== type)
        : [...prev.propertyTypes, type],
    }))
  }

  const addCity = () => {
    if (!cityInput.trim()) return
    setProfile((prev) => ({
      ...prev,
      preferredCities: [...prev.preferredCities, cityInput.trim()],
    }))
    setCityInput("")
  }

  const removeCity = (city: string) => {
    setProfile((prev) => ({
      ...prev,
      preferredCities: prev.preferredCities.filter((item) => item !== city),
    }))
  }

  const handleSave = async () => {
    if (!currentUserId) return
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: currentUserId,
          name: currentUserName,
          email: currentUserEmail,
          phone: profile.phone,
          bio: profile.bio,
          university: profile.university,
          grad_year: profile.gradYear,
          lease_duration: profile.leaseDuration,
          move_in_date: profile.moveInDate || null,
          property_types: profile.propertyTypes,
          preferred_cities: profile.preferredCities,
          parking: profile.parking,
          budget_min: profile.budgetMin,
          budget_max: profile.budgetMax,
          has_pets: profile.hasPets,
          pet_type: profile.petType,
        },
        { onConflict: "id" },
      )
    if (error) {
      toast.error("Failed to update profile.")
      return
    }
    toast.success("Profile updated successfully.")
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Profile"
        title="Manage Your Profile"
        subtitle="Update your contact details and housing preferences."
      />
      <Card className="border border-white/10 bg-white/10">
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input value={currentUserName} readOnly />
            <Input value={currentUserEmail} readOnly />
            <Input
              placeholder="Phone number"
              value={profile.phone}
              onChange={(event) =>
                setProfile({ ...profile, phone: event.target.value })
              }
            />
            <Input
              placeholder="University"
              value={profile.university}
              onChange={(event) =>
                setProfile({ ...profile, university: event.target.value })
              }
            />
            <Input
              placeholder="Expected graduation year"
              value={profile.gradYear}
              onChange={(event) =>
                setProfile({ ...profile, gradYear: event.target.value })
              }
            />
            <Input
              placeholder="Move-in date"
              value={profile.moveInDate}
              onChange={(event) =>
                setProfile({ ...profile, moveInDate: event.target.value })
              }
            />
          </div>
          <Textarea
            placeholder="Short bio"
            value={profile.bio}
            onChange={(event) =>
              setProfile({ ...profile, bio: event.target.value })
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <select
              className="h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white"
              value={profile.leaseDuration}
              onChange={(event) =>
                setProfile({ ...profile, leaseDuration: event.target.value })
              }
            >
              <option>6 months</option>
              <option>9 months</option>
              <option>12 months</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <Checkbox
                checked={profile.parking}
                onChange={(event) =>
                  setProfile({ ...profile, parking: event.target.checked })
                }
              />
              Require parking
            </label>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
              Preferred Property Types
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {propertyTypeOptions.map((type) => (
                <button
                  key={type}
                  onClick={() => togglePropertyType(type)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    profile.propertyTypes.includes(type)
                      ? "border-orange-400/60 bg-orange-400/10 text-orange-200"
                      : "border-white/10 text-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
              Preferred Cities
            </p>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Add city"
                value={cityInput}
                onChange={(event) => setCityInput(event.target.value)}
              />
              <Button variant="outline" onClick={addCity}>
                Add
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.preferredCities.map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 px-3 py-1 text-xs text-orange-200"
                >
                  {city}
                  <button onClick={() => removeCity(city)}>x</button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Minimum budget"
              value={profile.budgetMin}
              onChange={(event) =>
                setProfile({ ...profile, budgetMin: Number(event.target.value) })
              }
            />
            <Input
              placeholder="Maximum budget"
              value={profile.budgetMax}
              onChange={(event) =>
                setProfile({ ...profile, budgetMax: Number(event.target.value) })
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <Checkbox
                checked={profile.hasPets}
                onChange={(event) =>
                  setProfile({ ...profile, hasPets: event.target.checked })
                }
              />
              I have pets
            </label>
            {profile.hasPets ? (
              <Input
                placeholder="Pet type"
                value={profile.petType}
                onChange={(event) =>
                  setProfile({ ...profile, petType: event.target.value })
                }
              />
            ) : null}
          </div>

          <Button onClick={handleSave}>Save Profile</Button>
        </CardContent>
      </Card>
    </div>
  )
}
