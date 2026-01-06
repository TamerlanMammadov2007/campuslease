import { Link } from "react-router-dom"
import { toast } from "sonner"

import { SectionHeader } from "@/components/SectionHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDeleteListing, useProperties } from "@/hooks/useProperties"
import { useApp } from "@/context/AppContext"

export function MyListings() {
  const { data: listings = [], isLoading } = useProperties()
  const { mutateAsync: deleteListing } = useDeleteListing()
  const { currentUserEmail } = useApp()
  const ownedListings = listings.filter(
    (listing) => listing.owner?.email === currentUserEmail,
  )

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="My Listings"
        title="Manage Your Properties"
        subtitle="Edit, update, and track your active listings."
      />
      {isLoading ? (
        <Card>
          <CardContent className="text-slate-200">Loading listings...</CardContent>
        </Card>
      ) : ownedListings.length === 0 ? (
        <Card>
          <CardContent className="text-slate-200">
            You do not have any listings yet. Create your first listing to get
            started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ownedListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={listing.images[0] ?? "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop"}
                  alt={listing.title}
                  className="h-44 w-full object-cover"
                />
                <Badge
                  variant={
                    listing.status === "available"
                      ? "green"
                      : listing.status === "pending"
                        ? "yellow"
                        : "slate"
                  }
                  className="absolute left-4 top-4"
                >
                  {listing.status}
                </Badge>
              </div>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-lg font-semibold text-white">
                    {listing.title}
                  </p>
                  <p className="text-xs text-slate-300">
                    {listing.address}, {listing.city}
                  </p>
                </div>
                <p className="text-sm text-orange-200">
                  ${listing.price}/mo
                </p>
                <p className="text-xs text-slate-400">
                  Created {new Date(listing.createdDate).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/properties/${listing.id}`}>View</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link to={`/listings/${listing.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await deleteListing(listing.id)
                        toast.success("Listing deleted.")
                      } catch (error) {
                        const message =
                          error instanceof Error
                            ? error.message
                            : "Failed to delete listing."
                        toast.error(message)
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
