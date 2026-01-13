import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { SectionHeader } from "@/components/SectionHeader"
import { ListingForm } from "@/components/listings/ListingForm"
import { Card, CardContent } from "@/components/ui/card"
import { useProperty, useUpdateListing } from "@/hooks/useProperties"
import { useApp } from "@/context/AppContext"

export function EditListing() {
  const { id } = useParams()
  const { data: listing, isLoading } = useProperty(id)
  const { mutateAsync: updateListing } = useUpdateListing()
  const { currentUserId } = useApp()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-white">Loading listing...</CardContent>
      </Card>
    )
  }

  if (!listing) {
    return (
      <Card>
        <CardContent className="text-white">Listing not found.</CardContent>
      </Card>
    )
  }

  if (listing.ownerId !== currentUserId) {
    return (
      <Card>
        <CardContent className="text-white">
          You do not have permission to edit this listing.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Edit Listing"
        title={`Update ${listing.title}`}
        subtitle="Make quick updates to your listing details."
      />
      <ListingForm
        initial={listing}
        submitLabel="Update Listing"
        onSubmit={async (updated) => {
          try {
            await updateListing(updated)
            toast.success("Listing updated.")
            navigate("/listings")
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to update listing."
            toast.error(message)
          }
        }}
      />
    </div>
  )
}
