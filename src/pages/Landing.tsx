import { motion } from "framer-motion"
import { Building2, ShieldCheck, Sparkles, Bed, Bath, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useProperties } from "@/hooks/useProperties"

const benefits = [
  {
    icon: Building2,
    title: "Curated Listings",
    description:
      "Browse polished student-ready homes with transparent pricing and verified details.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Platform",
    description:
      "Message safely, save favorites, and manage listings in one trusted space.",
  },
]

const defaultImage =
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop"

export function Landing() {
  const { data: properties = [] } = useProperties()
  const featured = properties[0] ?? null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center"
        >
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-orange-400/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-orange-200">
              <Sparkles size={14} />
              CampusLease
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Find Your Perfect Student Home
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              A housing marketplace built for campus life. Explore listings and
              manage messages in one unified experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link to="/map">Browse Listings</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {featured ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-orange-400/30 blur-2xl" />
              <Link to={`/properties/${featured.id}`}>
                <Card className="relative overflow-hidden border border-white/10 bg-white/10 transition hover:border-white/20">
                  <CardContent className="space-y-4">
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Latest Listing
                    </div>
                    <img
                      src={featured.images[0] ?? defaultImage}
                      alt={featured.title}
                      className="h-48 w-full rounded-2xl object-cover"
                    />
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-white line-clamp-1">{featured.title}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-300">
                          <MapPin size={11} /> {featured.city}
                        </p>
                        <p className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Bed size={11} /> {featured.bedrooms} bed</span>
                          <span className="flex items-center gap-1"><Bath size={11} /> {featured.bathrooms} bath</span>
                        </p>
                      </div>
                      <div className="rounded-full bg-gradient-to-r from-orange-400 to-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 shrink-0">
                        ${featured.price.toLocaleString()}/mo
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-orange-400/30 blur-2xl" />
              <Card className="relative overflow-hidden border border-white/10 bg-white/10">
                <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <Building2 size={40} className="text-orange-300" />
                  <p className="font-semibold text-white">Listings coming soon</p>
                  <p className="text-sm text-slate-400">Be the first to list your property.</p>
                  <Button asChild size="sm">
                    <Link to="/create">List Your Property</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
            >
              <Card className="h-full border border-white/10 bg-white/10">
                <CardContent className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-400/20 text-orange-200">
                    <benefit.icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-slate-300">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
