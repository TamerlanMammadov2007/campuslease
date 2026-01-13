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
  createdDate: string
}

export type RoommateProfile = {
  id: string
  userId?: string
  name: string
  age: number
  gender: string
  university: string
  major: string
  bio: string
  photo?: string
  budgetMin: number
  budgetMax: number
  moveInDate: string
  preferredLocations: string[]
  sleepSchedule: "Early Bird" | "Night Owl" | "Flexible"
  cleanliness: "Very Clean" | "Moderately Clean" | "Relaxed"
  noise: "Quiet" | "Moderate" | "Lively"
  guests: "Rarely" | "Sometimes" | "Often"
  smoking: "No" | "Yes"
  drinking: "No" | "Yes" | "Sometimes"
  pets: "No Pets" | "Has Pets" | "Open to Pets"
  studyHabits: "Focused" | "Balanced" | "Flexible"
  socialLevel: "Low-key" | "Social" | "Very Social"
  interests: string[]
  compatibilityScore?: number
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
