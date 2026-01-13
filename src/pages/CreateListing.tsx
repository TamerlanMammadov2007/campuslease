import React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { SectionHeader } from "@/components/SectionHeader"
import { ListingForm } from "@/components/listings/ListingForm"
import { useApp } from "@/context/AppContext"
import type { Property } from "@/data/types"
import { useCreateListing } from "@/hooks/useProperties"

const createEmptyListing = (name: string, email: string, ownerId: string): Property => ({
  id: "",
  title: "",
  address: "",
  city: "",
  price: 0,
  bedrooms: 1,
  bathrooms: 1,
  squareFeet: 600,
  type: "Apartment",
  images: [],
  amenities: [],
  utilitiesIncluded: false,
  petsAllowed: false,
  parkingAvailable: false,
  furnished: false,
  availableFrom: "2025-01-01",
  availableUntil: "",
  owner: {
    name,
    email,
    phone: "555-000-0000",
  },
  ownerId,
  status: "available",
  coordinates: {
    lat: 30.2849,
    lng: -97.7361,
  },
  description: "",
  createdDate: new Date().toISOString(),
})

export function CreateListing() {
  const { mutateAsync: createListing } = useCreateListing()
  const { currentUserEmail, currentUserName, currentUserId } = useApp()
  const navigate = useNavigate()
  const emptyListing = React.useMemo(
    () => createEmptyListing(currentUserName, currentUserEmail, currentUserId),
    [currentUserEmail, currentUserId, currentUserName],
  )

  const handleSubmit = async (property: Property) => {
    try {
      await createListing({
        ...property,
        createdDate: new Date().toISOString(),
      })
      toast.success("Listing created successfully.")
      navigate("/listings")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create listing."
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 p-6 text-white">
        <SectionHeader
          eyebrow="Create Listing"
          title="List Your Property"
          subtitle="Showcase your property to thousands of student renters."
        />
      </div>
      <ListingForm
        initial={emptyListing}
        onSubmit={handleSubmit}
        submitLabel="Create Listing"
      />
    </div>
  )
}
