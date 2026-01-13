import React, { useMemo } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SectionHeader } from "@/components/SectionHeader"
import {
  useAdminApplications,
  useAdminListings,
  useAdminLoginEvents,
  useAdminStats,
  useAdminThreads,
  useAdminUpdateListing,
  useAdminDeleteListing,
  useAdminUpdateUser,
  useAdminUsers,
} from "@/hooks/useAdmin"
import { supabase } from "@/lib/supabase"

export function AdminDashboard() {
  const { data: stats } = useAdminStats()
  const [adminEmail, setAdminEmail] = React.useState("")
  const { data: users = [] } = useAdminUsers()
  const { data: listings = [] } = useAdminListings()
  const { data: applications = [] } = useAdminApplications()
  const { data: threads = [] } = useAdminThreads()
  const { data: loginEvents = [] } = useAdminLoginEvents()
  const { mutateAsync: updateListing } = useAdminUpdateListing()
  const { mutateAsync: deleteListing } = useAdminDeleteListing()
  const { mutateAsync: updateUser } = useAdminUpdateUser()

  const [editingListingId, setEditingListingId] = React.useState<string | null>(null)
  const [listingDraft, setListingDraft] = React.useState({
    title: "",
    city: "",
    price: 0,
    status: "available",
  })
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null)
  const [userDraft, setUserDraft] = React.useState({
    name: "",
  })

  const summaryCards = useMemo(
    () => [
      { label: "Users", value: stats?.users ?? 0 },
      { label: "Listings", value: stats?.listings ?? 0 },
      { label: "Applications", value: stats?.applications ?? 0 },
      { label: "Threads", value: stats?.threads ?? 0 },
      { label: "Messages", value: stats?.messages ?? 0 },
    ],
    [stats],
  )

  React.useEffect(() => {
    const loadAdmin = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) {
        setAdminEmail("")
        return
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .maybeSingle()
      setAdminEmail(profile?.email ?? "")
    }
    void loadAdmin()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.from("admin_login_events").insert({
        user_id: null,
        email: adminEmail,
        event_type: "logout",
      })
      await supabase.auth.signOut()
      window.location.href = "/admin/login"
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to log out."
      toast.error(message)
    }
  }

  const startEditListing = (listing: typeof listings[number]) => {
    setEditingListingId(listing.id)
    setListingDraft({
      title: listing.title,
      city: listing.city,
      price: listing.price,
      status: listing.status,
    })
  }

  const startEditUser = (user: typeof users[number]) => {
    setEditingUserId(user.id)
    setUserDraft({
      name: user.name,
    })
  }

  const handleSaveListing = async () => {
    if (!editingListingId) return
    try {
      await updateListing({
        id: editingListingId,
        data: {
          title: listingDraft.title,
          city: listingDraft.city,
          price: listingDraft.price,
          status: listingDraft.status as "available" | "pending" | "leased",
        },
      })
      toast.success("Listing updated.")
      setEditingListingId(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update listing."
      toast.error(message)
    }
  }

  const handleDeleteListing = async (id: string) => {
    try {
      await deleteListing(id)
      toast.success("Listing deleted.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete listing."
      toast.error(message)
    }
  }

  const handleSaveUser = async () => {
    if (!editingUserId) return
    try {
      await updateUser({
        id: editingUserId,
        data: {
          name: userDraft.name,
        },
      })
      toast.success("User updated.")
      setEditingUserId(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user."
      toast.error(message)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeader
          eyebrow="Admin Panel"
          title="CampusLease Administration"
          subtitle="Monitor platform activity and inventory at a glance."
        />
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-slate-300">{adminEmail}</span>
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border border-white/10 bg-white/10">
            <CardContent className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                {card.label}
              </p>
              <p className="text-2xl font-semibold text-white">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-white/10 bg-white/10">
          <CardContent className="space-y-4">
            <p className="text-sm font-semibold text-white">Recent Users</p>
            {users.slice(0, 6).map((user) => (
              <div key={user.id} className="rounded-2xl border border-white/10 p-3 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span>{user.name}</span>
                  <span className="text-xs text-slate-400">{user.email}</span>
                </div>
                {editingUserId === user.id ? (
                  <div className="mt-3 space-y-2">
                    <input
                      className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white"
                      value={userDraft.name}
                      onChange={(event) =>
                        setUserDraft((prev) => ({ ...prev, name: event.target.value }))
                      }
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveUser}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingUserId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => startEditUser(user)}>
                    Edit
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/10">
          <CardContent className="space-y-4">
            <p className="text-sm font-semibold text-white">Recent Listings</p>
            {listings.slice(0, 6).map((listing) => (
              <div key={listing.id} className="rounded-2xl border border-white/10 p-3 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span>{listing.title}</span>
                  <span className="text-xs text-slate-400">
                    {listing.owner?.email ?? "Unknown owner"} · ${listing.price}/mo
                  </span>
                </div>
                {editingListingId === listing.id ? (
                  <div className="mt-3 space-y-2">
                    <input
                      className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white"
                      value={listingDraft.title}
                      onChange={(event) =>
                        setListingDraft((prev) => ({ ...prev, title: event.target.value }))
                      }
                    />
                    <input
                      className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white"
                      value={listingDraft.city}
                      onChange={(event) =>
                        setListingDraft((prev) => ({ ...prev, city: event.target.value }))
                      }
                    />
                    <input
                      type="number"
                      className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white"
                      value={listingDraft.price}
                      onChange={(event) =>
                        setListingDraft((prev) => ({
                          ...prev,
                          price: Number(event.target.value),
                        }))
                      }
                    />
                    <select
                      className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white"
                      value={listingDraft.status}
                      onChange={(event) =>
                        setListingDraft((prev) => ({ ...prev, status: event.target.value }))
                      }
                    >
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="leased">Leased</option>
                    </select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveListing}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingListingId(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteListing(listing.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEditListing(listing)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteListing(listing.id)}>
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-white/10 bg-white/10">
          <CardContent className="space-y-4">
            <p className="text-sm font-semibold text-white">Applications</p>
            {applications.slice(0, 6).map((application) => (
              <div key={application.id} className="text-sm text-slate-200">
                <p className="font-semibold">
                  {application.name} · {application.email}
                </p>
                <p className="text-xs text-slate-400">
                  {application.listing_title ?? `Listing ${application.listing_id}`}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/10">
          <CardContent className="space-y-4">
            <p className="text-sm font-semibold text-white">Threads</p>
            {threads.slice(0, 6).map((thread) => (
              <div key={thread.id} className="text-sm text-slate-200">
                <p className="font-semibold">{thread.participantName}</p>
                <p className="text-xs text-slate-400">
                  {thread.propertyTitle ?? "Roommate thread"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-white/10 bg-white/10">
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-white">Recent Login Events</p>
          {loginEvents.slice(0, 8).map((event) => (
            <div key={event.id} className="flex items-center justify-between text-sm text-slate-200">
              <span>{event.email}</span>
              <span className="text-xs text-slate-400">
                {event.event_type} · {new Date(event.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
