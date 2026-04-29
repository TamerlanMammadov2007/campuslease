export type PropertyStatus = "available" | "pending" | "leased"

export type Property = {
  id: string
  title: string
  address: string
  city: string
  price: number
  bedrooms: number
  bathrooms: number
  squareFeet: number
  type: "Apartment" | "House" | "Studio" | "Townhome"
  images: string[]
  amenities: string[]
  utilitiesIncluded: boolean
  petsAllowed: boolean
  parkingAvailable: boolean
  furnished: boolean
  availableFrom: string
  availableUntil?: string
  owner: {
    name: string
    email: string
    phone: string
  }
  ownerId?: string
  status: PropertyStatus
  coordinates: {
    lat: number
    lng: number
  }
  description: string
  nearbyUniversity?: string
  createdDate: string
}

export type Message = {
  id: string
  threadId: string
  sender: string
  senderEmail: string
  recipient: string
  recipientEmail: string
  content: string
  createdAt: string
  read: boolean
}

export type MessageThread = {
  id: string
  propertyId?: string
  propertyTitle?: string
  participantName: string
  participantEmail: string
  messages: Message[]
}
