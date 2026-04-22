import React from "react"
import { toast } from "sonner"

import { Breadcrumb } from "@/components/Breadcrumb"
import { SectionHeader } from "@/components/SectionHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"
import { SEO } from "@/components/SEO"

type ProfileState = {
  phone: string
  bio: string
  university: string
  gradYear: string
}

const defaultProfile: ProfileState = {
  phone: "",
  bio: "",
  university: "",
  gradYear: "",
}

export function Profile() {
  const { currentUserEmail, currentUserName, currentUserId } = useApp()
  const [profile, setProfile] = React.useState<ProfileState>(defaultProfile)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    const loadProfile = async () => {
      if (!currentUserId) return
      const { data, error } = await supabase
        .from("profiles")
        .select("phone,bio,university,grad_year")
        .eq("id", currentUserId)
        .maybeSingle()
      if (error || !data) return
      setProfile({
        phone: data.phone ?? "",
        bio: data.bio ?? "",
        university: data.university ?? "",
        gradYear: data.grad_year ?? "",
      })
    }
    void loadProfile()
  }, [currentUserId])

  const handleSave = async () => {
    if (!currentUserId) {
      toast.error("You must be logged in to save your profile.")
      return
    }
    setIsSubmitting(true)
    try {
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
          },
          { onConflict: "id" },
        )
      if (error) throw error
      toast.success("Profile updated successfully.")
    } catch {
      toast.error("Failed to update profile.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <SEO title="My Profile" description="Manage your CampusLease account and contact details." url="/profile" />
      <Breadcrumb items={[{ label: "Profile" }]} />
      <SectionHeader
        eyebrow="Profile"
        title="Manage Your Profile"
        subtitle="Update your contact details."
      />
      <Card className="border border-white/10 bg-white/10">
        <CardContent className="space-y-4 pt-1">
          <div className="grid gap-4 md:grid-cols-2">
            <Input value={currentUserName} readOnly />
            <Input value={currentUserEmail} readOnly />
            <Input
              placeholder="Phone number"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
            <Input
              placeholder="University"
              value={profile.university}
              onChange={(e) => setProfile({ ...profile, university: e.target.value })}
            />
            <Input
              placeholder="Expected graduation year"
              value={profile.gradYear}
              onChange={(e) => setProfile({ ...profile, gradYear: e.target.value })}
            />
          </div>
          <Textarea
            placeholder="Short bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
          <Button
            variant="ghost"
            className="text-red-400 hover:text-red-300"
            onClick={async () => {
              const confirmed = window.confirm("Are you sure you want to delete your account? This cannot be undone.")
              if (!confirmed) return
              const { error } = await supabase.auth.signOut()
              if (!error) {
                await supabase.from("profiles").delete().eq("id", currentUserId)
                window.location.href = "/"
              }
            }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
