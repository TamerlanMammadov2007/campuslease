import React, { useMemo } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

function exportCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? "")).join(","),
    ),
  ].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

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
  const [userDraft, setUserDraft] = React.useState({ name: "" })

  const [userSearch, setUserSearch] = React.useState("")
  const [listingSearch, setListingSearch] = React.useState("")
  const [emailTo, setEmailTo] = React.useState("")
  const [emailSubject, setEmailSubject] = React.useState("")
  const [emailMessage, setEmailMessage] = React.useState("")
  const [isSendingEmail, setIsSendingEmail] = React.useState(false)

  const handleSendEmail = async () => {
    if (!emailTo.trim() || !emailSubject.trim() || !emailMessage.trim()) {
      toast.error("Please fill in all fields.")
      return
    }
    setIsSendingEmail(true)
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: { to: emailTo.trim(), subject: emailSubject.trim(), message: emailMessage.trim() },
      })
      if (error) throw error
      toast.success("Email sent.")
      setEmailTo("")
      setEmailSubject("")
      setEmailMessage("")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send email."
      toast.error(message)
    } finally {
      setIsSendingEmail(false)
    }
  }

  const [showAllUsers, setShowAllUsers] = React.useState(false)
  const [showAllListings, setShowAllListings] = React.useState(false)
  const [showAllApplications, setShowAllApplications] = React.useState(false)
  const [showAllThreads, setShowAllThreads] = React.useState(false)
  const [expandedApplicationId, setExpandedApplicationId] = React.useState<string | null>(null)

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(userSearch.toLowerCase()),
      ),
    [users, userSearch],
  )

  const filteredListings = useMemo(
    () =>
      listings.filter(
        (l) =>
          l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
          l.city.toLowerCase().includes(listingSearch.toLowerCase()),
      ),
    [listings, listingSearch],
  )

  const visibleUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 6)
  const visibleListings = showAllListings ? filteredListings : filteredListings.slice(0, 6)
  const visibleApplications = showAllApplications ? applications : applications.slice(0, 6)
  const visibleThreads = showAllThreads ? threads : threads.slice(0, 6)

  const summaryCards = useMemo(
    () => [
      { label: "Total Users", value: stats?.users ?? 0 },
      { label: "New This Week", value: stats?.newUsersThisWeek ?? 0 },
      { label: "Listings", value: stats?.listings ?? 0 },
      { label: "Applications", value: stats?.applications ?? 0 },
      { label: "Threads", value: stats?.threads ?? 0 },
      { label: "Messages", value: stats?.messages ?? 0 },
      { label: "Roommate Profiles", value: stats?.roommateProfiles ?? 0 },
    ],
    [stats],
  )

  const statusCards = useMemo(
    () => [
      { label: "Available", value: stats?.availableListings ?? 0, color: "text-emerald-300" },
      { label: "Pending", value: stats?.pendingListings ?? 0, color: "text-amber-300" },
      { label: "Leased", value: stats?.leasedListings ?? 0, color: "text-slate-400" },
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
    setUserDraft({ name: user.name })
  }

  const handleSaveListing = async () => {
    if (!editingListingId) return
    if (!listingDraft.title.trim()) {
      toast.error("Title cannot be empty.")
      return
    }
    if (!listingDraft.city.trim()) {
      toast.error("City cannot be empty.")
      return
    }
    if (!listingDraft.price || listingDraft.price <= 0) {
      toast.error("Price must be greater than 0.")
      return
    }
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
        data: { name: userDraft.name },
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

      {/* Main stats */}
      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
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

      {/* Listing status breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        {statusCards.map((card) => (
          <Card key={card.label} className="border border-white/10 bg-white/10">
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-slate-300">Listings — {card.label}</p>
              <p className={`text-2xl font-semibold ${card.color}`}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users */}
      <Card className="border border-white/10 bg-white/10">
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">
              Users ({filteredUsers.length})
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-48"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  exportCSV(
                    "users.csv",
                    users.map((u) => ({
                      name: u.name,
                      email: u.email,
                      joined: u.created_at,
                    })),
                  )
                }
              >
                Export CSV
              </Button>
            </div>
          </div>
          {visibleUsers.map((user) => (
            <div key={user.id} className="rounded-2xl border border-white/10 p-3 text-sm text-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium">{user.name}</span>
                  <span className="ml-3 text-xs text-slate-400">{user.email}</span>
                </div>
                <span className="text-xs text-slate-500">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
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
                    <Button size="sm" onClick={handleSaveUser}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingUserId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => startEditUser(user)}>
                  Edit
                </Button>
              )}
            </div>
          ))}
          {filteredUsers.length > 6 && (
            <Button variant="ghost" size="sm" onClick={() => setShowAllUsers((v) => !v)}>
              {showAllUsers ? "Show less" : `Show all ${filteredUsers.length} users`}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Listings */}
      <Card className="border border-white/10 bg-white/10">
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">
              Listings ({filteredListings.length})
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Search listings..."
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                className="w-48"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  exportCSV(
                    "listings.csv",
                    listings.map((l) => ({
                      title: l.title,
                      city: l.city,
                      price: l.price,
                      status: l.status,
                      owner: l.owner.email,
                      created: l.createdDate,
                    })),
                  )
                }
              >
                Export CSV
              </Button>
            </div>
          </div>
          {visibleListings.map((listing) => (
            <div key={listing.id} className="rounded-2xl border border-white/10 p-3 text-sm text-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{listing.title}</span>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span
                    className={
                      listing.status === "available"
                        ? "text-emerald-300"
                        : listing.status === "pending"
                          ? "text-amber-300"
                          : "text-slate-400"
                    }
                  >
                    {listing.status}
                  </span>
                  <span>{listing.owner?.email ?? "Unknown owner"}</span>
                  <span>${listing.price}/mo</span>
                  <span>{listing.city}</span>
                </div>
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
                      setListingDraft((prev) => ({ ...prev, price: Number(event.target.value) }))
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
                    <Button size="sm" onClick={handleSaveListing}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingListingId(null)}>Cancel</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteListing(listing.id)}>Delete</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => startEditListing(listing)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteListing(listing.id)}>Delete</Button>
                </div>
              )}
            </div>
          ))}
          {filteredListings.length > 6 && (
            <Button variant="ghost" size="sm" onClick={() => setShowAllListings((v) => !v)}>
              {showAllListings ? "Show less" : `Show all ${filteredListings.length} listings`}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applications */}
        <Card className="border border-white/10 bg-white/10">
          <CardContent className="space-y-4">
            <p className="text-sm font-semibold text-white">
              Applications ({applications.length})
            </p>
            {visibleApplications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-white/10 p-3 text-sm text-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {application.name}
                    </p>
                    <p className="text-xs text-slate-400">{application.email}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {application.listing_title ?? `Listing ${application.listing_id}`}
                  </p>
                </div>
                {application.message && (
                  <div className="mt-2">
                    {expandedApplicationId === application.id ? (
                      <p className="text-xs text-slate-300">{application.message}</p>
                    ) : (
                      <p className="truncate text-xs text-slate-400">{application.message}</p>
                    )}
                    <button
                      className="mt-1 text-xs text-orange-300 hover:text-orange-200"
                      onClick={() =>
                        setExpandedApplicationId(
                          expandedApplicationId === application.id ? null : application.id,
                        )
                      }
                    >
                      {expandedApplicationId === application.id ? "Show less" : "Show message"}
                    </button>
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(application.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {applications.length > 6 && (
              <Button variant="ghost" size="sm" onClick={() => setShowAllApplications((v) => !v)}>
                {showAllApplications ? "Show less" : `Show all ${applications.length} applications`}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Threads */}
        <Card className="border border-white/10 bg-white/10">
          <CardContent className="space-y-4">
            <p className="text-sm font-semibold text-white">
              Threads ({threads.length})
            </p>
            {visibleThreads.map((thread) => (
              <div key={thread.id} className="rounded-2xl border border-white/10 p-3 text-sm text-slate-200">
                <p className="font-semibold">{thread.participantName}</p>
                <p className="text-xs text-slate-400">
                  {thread.propertyTitle ?? "Roommate thread"}
                </p>
              </div>
            ))}
            {threads.length > 6 && (
              <Button variant="ghost" size="sm" onClick={() => setShowAllThreads((v) => !v)}>
                {showAllThreads ? "Show less" : `Show all ${threads.length} threads`}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Send Email */}
      <Card className="border border-white/10 bg-white/10">
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-white">Send Email to User</p>
          <Input
            placeholder="Recipient email (e.g. hurshs1408@gmail.com)"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
          />
          <Input
            placeholder="Subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
          />
          <Textarea
            placeholder="Message..."
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            rows={5}
          />
          <Button onClick={handleSendEmail} disabled={isSendingEmail}>
            {isSendingEmail ? "Sending..." : "Send Email"}
          </Button>
        </CardContent>
      </Card>

      {/* Login events */}
      <Card className="border border-white/10 bg-white/10">
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-white">
            Recent Login Events
          </p>
          {loginEvents.slice(0, 10).map((event) => (
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
