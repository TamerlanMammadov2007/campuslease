import React from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { Calendar, CheckCircle2, Mail, Phone } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useProperty, useProperties } from "@/hooks/useProperties"
import { useApp } from "@/context/AppContext"
import { SectionHeader } from "@/components/SectionHeader"
import { PropertyCard } from "@/components/properties/PropertyCard"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useCreateThread } from "@/hooks/useThreads"
import { useCreateApplication } from "@/hooks/useApplications"

export function PropertyDetails() {
  const { id } = useParams()
  const { data: property } = useProperty(id)
  const { data: properties = [] } = useProperties()
  const { isAuthenticated } = useApp()
  const navigate = useNavigate()
  const { mutateAsync: createThread } = useCreateThread()
  const { mutateAsync: createApplication } = useCreateApplication()
  const [activeImage, setActiveImage] = React.useState(0)
  const [message, setMessage] = React.useState("")

  if (!property) {
    return (
      <Card>
        <CardContent className="text-white">Loading property...</CardContent>
      </Card>
    )
  }

  const similar = properties
    .filter(
      (item) => item.id !== property.id && item.type === property.type,
    )
    .slice(0, 3)

  const handleSendMessage = async () => {
    if (!message.trim()) return
    if (!isAuthenticated) {
      toast.error("Please log in to message owners.")
      navigate("/login")
      return
    }
    try {
      await createThread({
        propertyId: property.id,
        propertyTitle: property.title,
        participantName: property.owner.name,
        participantEmail: property.owner.email,
        message,
      })
      try {
        await createApplication({
          listingId: property.id,
          message,
        })
      } catch {
        toast.warning("Message sent, but the application could not be saved.")
      }
      toast.success("Message sent. Check your inbox for replies.")
      setMessage("")
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message."
      toast.error(errorMessage)
    }
  }

  const images =
    property.images.length > 0
      ? property.images
      : [
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1400&auto=format&fit=crop",
        ]

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Property Details"
        title={property.title}
        subtitle={`${property.address}, ${property.city}`}
      />

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden border border-white/10 bg-white/10">
            <CardContent className="space-y-4">
              <img
                src={images[activeImage]}
                alt={property.title}
                className="h-80 w-full rounded-2xl object-cover"
              />
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => setActiveImage(index)}
                    className={`h-20 w-28 overflow-hidden rounded-2xl border ${
                      index === activeImage
                        ? "border-orange-400/70"
                        : "border-white/10"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/10">
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
                  Overview
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {property.description}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    Amenities
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {property.amenities.map((amenity) => (
                      <li key={amenity} className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-300" />
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    Availability
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-200">
                    <Calendar size={16} className="text-orange-200" />
                    Available {format(new Date(property.availableFrom), "PPP")}
                  </div>
                  <p className="mt-4 text-xs text-slate-400">
                    Utilities included: {property.utilitiesIncluded ? "Yes" : "No"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Parking: {property.parkingAvailable ? "Available" : "No"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {similar.length ? (
            <div className="space-y-4">
              <p className="text-lg font-semibold text-white">
                Recommended Similar Properties
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {similar.map((item) => (
                  <PropertyCard key={item.id} property={item} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="sticky top-8 border border-white/10 bg-white/10">
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-amber-300 px-4 py-3 text-sm font-semibold text-slate-900">
                ${property.price}/month
              </div>
              <div>
                <p className="text-sm text-slate-300">Property Owner</p>
                <p className="text-lg font-semibold text-white">
                  {property.owner.name}
                </p>
              </div>
              <div className="space-y-2 text-sm text-slate-200">
                <a
                  href={`mailto:${property.owner.email}`}
                  className="flex items-center gap-2 hover:text-orange-200"
                >
                  <Mail size={14} />
                  {property.owner.email}
                </a>
                <a
                  href={`tel:${property.owner.phone}`}
                  className="flex items-center gap-2 hover:text-orange-200"
                >
                  <Phone size={14} />
                  {property.owner.phone}
                </a>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Subject"
                  value={`Inquiry about ${property.title}`}
                  readOnly
                />
                <Textarea
                  placeholder="Write a message..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <Button className="w-full" onClick={handleSendMessage}>
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button asChild variant="outline" className="w-full">
              <Link to="/browse">Back to Browse</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
