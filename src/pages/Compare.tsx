import { useMemo, type ReactNode } from "react"
import { Link } from "react-router-dom"

import { SectionHeader } from "@/components/SectionHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useApp } from "@/context/AppContext"
import { useProperties } from "@/hooks/useProperties"
import type { Property } from "@/data/types"

export function Compare() {
  const { compareIds } = useApp()
  const { data: properties = [] } = useProperties()

  const selected = useMemo(
    () => properties.filter((property) => compareIds.includes(property.id)),
    [compareIds, properties],
  )

  if (selected.length === 0) {
    return (
      <Card>
        <CardContent className="text-white">
          No properties selected for comparison.
        </CardContent>
      </Card>
    )
  }

  const rows: { label: string; value: (item: Property) => ReactNode }[] = [
    { label: "Price", value: (item) => `$${item.price}/mo` },
    { label: "Location", value: (item) => `${item.address}, ${item.city}` },
    { label: "Bedrooms", value: (item) => item.bedrooms },
    { label: "Bathrooms", value: (item) => item.bathrooms },
    { label: "Square Feet", value: (item) => item.squareFeet },
    { label: "Availability", value: (item) => item.availableFrom },
    {
      label: "Utilities Included",
      value: (item) => (item.utilitiesIncluded ? "Yes" : "No"),
    },
    { label: "Parking", value: (item) => (item.parkingAvailable ? "Yes" : "No") },
    { label: "Amenities", value: (item) => item.amenities.join(", ") },
  ]

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Compare"
        title="Side-by-Side Comparison"
        subtitle="Review listings across the details that matter most."
      />
      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5">
        <table className="min-w-[900px] w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-950/60 text-xs uppercase text-slate-300">
            <tr>
              <th className="p-4">Attribute</th>
              {selected.map((property) => (
                <th key={property.id} className="p-4 text-white">
                  <div className="space-y-2">
                    <img
                      src={
                        property.images[0] ??
                        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop"
                      }
                      alt={property.title}
                      className="h-16 w-full rounded-2xl object-cover"
                    />
                    <Link
                      to={`/properties/${property.id}`}
                      className="font-semibold text-white hover:text-orange-200"
                    >
                      {property.title}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-white/10 last:border-b-0"
              >
                <td className="p-4 font-semibold text-white">{row.label}</td>
                {selected.map((property) => (
                  <td key={property.id} className="p-4 text-slate-200">
                    {row.value(property)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button asChild variant="outline">
        <Link to="/browse">Back to Browse</Link>
      </Button>
    </div>
  )
}
