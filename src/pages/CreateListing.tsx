import React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { SectionHeader } from "@/components/SectionHeader"
import { ListingForm } from "@/components/listings/ListingForm"
import { useApp } from "@/context/AppContext"
import type { Property } from "@/data/types"
import { usePayPalScript } from "@/hooks/usePayPalScript"
import { useCreateListing } from "@/hooks/useProperties"

const LISTING_FEE = "0.99"
const LISTING_CURRENCY = "USD"

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
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined
  const { isReady: isPayPalReady, error: payPalScriptError } = usePayPalScript(
    paypalClientId,
    LISTING_CURRENCY,
  )
  const payPalContainerRef = React.useRef<HTMLDivElement | null>(null)
  const cardContainerRef = React.useRef<HTMLDivElement | null>(null)
  const payPalRenderedRef = React.useRef({
    paypal: false,
    card: false,
  })
  const [paymentApproved, setPaymentApproved] = React.useState(false)
  const [paymentId, setPaymentId] = React.useState<string | null>(null)
  const [paymentError, setPaymentError] = React.useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = React.useState<"paypal" | "card">(
    "paypal",
  )
  const emptyListing = React.useMemo(
    () => createEmptyListing(currentUserName, currentUserEmail, currentUserId),
    [currentUserEmail, currentUserId, currentUserName],
  )

  React.useEffect(() => {
    if (!isPayPalReady || paymentApproved) return
    if (!window.paypal) {
      setPaymentError("PayPal SDK not available.")
      return
    }

    const target =
      paymentMethod === "paypal" ? payPalContainerRef.current : cardContainerRef.current
    if (!target) return
    if (payPalRenderedRef.current[paymentMethod]) return

    payPalRenderedRef.current[paymentMethod] = true
    const fundingSource =
      paymentMethod === "card" ? window.paypal.FUNDING.CARD : window.paypal.FUNDING.PAYPAL
    const buttons = window.paypal.Buttons({
      fundingSource,
      createOrder: (_data, actions) =>
        actions.order.create({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: LISTING_CURRENCY,
                value: LISTING_FEE,
              },
              description: "CampusLease listing fee",
            },
          ],
        }),
      onApprove: async (data, actions) => {
        try {
          const details = await actions.order.capture()
          setPaymentId(data.orderID ?? details.id ?? null)
          setPaymentApproved(true)
          toast.success("Payment received. You can post your listing.")
        } catch (error) {
          console.error(error)
          setPaymentError("Payment capture failed.")
          payPalRenderedRef.current[paymentMethod] = false
          toast.error("Payment capture failed.")
        }
      },
      onError: (error) => {
        console.error(error)
        setPaymentError("PayPal checkout failed.")
        payPalRenderedRef.current[paymentMethod] = false
        toast.error("PayPal checkout failed.")
      },
    })

    buttons.render(target).catch((error) => {
      console.error(error)
      setPaymentError("PayPal checkout failed to render.")
      payPalRenderedRef.current[paymentMethod] = false
    })

    return () => {
      buttons.close()
    }
  }, [isPayPalReady, paymentApproved, paymentMethod])

  const handleSubmit = async (property: Property) => {
    if (!paymentApproved) {
      toast.error("Complete the $0.99 payment before publishing.")
      return
    }

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
        submitDisabled={!paymentApproved}
        submitHint="Complete the $0.99 payment to publish."
        beforeSubmit={
          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">
                  Listing fee
                </p>
                <p className="text-sm text-slate-200">
                  Pay the one-time posting fee before you publish.
                </p>
              </div>
              <p className="text-3xl font-semibold">${LISTING_FEE}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("paypal")}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${
                  paymentMethod === "paypal"
                    ? "border-orange-300/70 bg-white/10 text-orange-100"
                    : "border-white/10 text-slate-300 hover:border-orange-200/60"
                }`}
              >
                PayPal
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${
                  paymentMethod === "card"
                    ? "border-orange-300/70 bg-white/10 text-orange-100"
                    : "border-white/10 text-slate-300 hover:border-orange-200/60"
                }`}
              >
                Credit / Debit
              </button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              {paymentApproved ? (
                <div className="text-sm text-emerald-200">
                  Payment received{paymentId ? ` (ID: ${paymentId}).` : "."}
                </div>
              ) : payPalScriptError ? (
                <p className="text-sm text-rose-200">{payPalScriptError}</p>
              ) : paymentError ? (
                <p className="text-sm text-rose-200">{paymentError}</p>
              ) : !isPayPalReady ? (
                <p className="text-sm text-slate-300">Loading checkout...</p>
              ) : paymentMethod === "paypal" ? (
                <div ref={payPalContainerRef} />
              ) : (
                <div ref={cardContainerRef} />
              )}
            </div>
            <p className="text-xs text-slate-300">
              Choose PayPal or card to complete your $0.99 listing fee.
            </p>
          </div>
        }
      />
    </div>
  )
}
