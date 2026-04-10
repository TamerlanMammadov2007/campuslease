import { useState } from "react"
import { motion } from "framer-motion"
import {
  Building2,
  ShieldCheck,
  Sparkles,
  Search,
  MessageCircle,
  CalendarCheck,
  FileText,
  ListPlus,
  Users,
  LayoutDashboard,
  BadgeDollarSign,
  Zap,
  GraduationCap,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SEO } from "@/components/SEO"
import { useProperties } from "@/hooks/useProperties"

// ─── Data ────────────────────────────────────────────────────────────────────

const renterSteps = [
  { icon: Search, title: "Search", desc: "Filter listings by university, price, bedrooms, and amenities." },
  { icon: MessageCircle, title: "Message", desc: "Contact landlords directly — no middlemen, no delays." },
  { icon: CalendarCheck, title: "Tour", desc: "Schedule a tour and see the place before you commit." },
  { icon: FileText, title: "Lease", desc: "Sign and move in. Everything tracked in one place." },
]

const landlordSteps = [
  { icon: ListPlus, title: "List", desc: "Post your property in minutes with photos, pricing, and details." },
  { icon: Users, title: "Connect", desc: "Receive messages from verified students instantly." },
  { icon: LayoutDashboard, title: "Manage", desc: "Track applications and conversations from your dashboard." },
  { icon: BadgeDollarSign, title: "Get Paid", desc: "Sign your tenant and collect rent with confidence." },
]

const whyUs = [
  {
    icon: GraduationCap,
    title: "Built for Campus Life",
    desc: "Every feature is designed around the student rental cycle — semester leases, subletting, proximity to campus.",
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    desc: "Talk to landlords instantly without filling out forms or waiting for callbacks like on Zillow.",
  },
  {
    icon: Zap,
    title: "Faster Than Zillow",
    desc: "No clutter, no irrelevant listings. Just student-focused rentals near your specific university.",
  },
  {
    icon: ShieldCheck,
    title: "Free for Students",
    desc: "Browsing and messaging is always free for students. Landlords pay a small fee to list.",
  },
]

const landlordPerks = [
  {
    badge: "Launch Special",
    title: "First 3 Months Free",
    desc: "The first 100 landlords to list get 3 months of premium placement at no cost.",
  },
  {
    badge: "Early Access",
    title: "Featured on Homepage",
    desc: "Early listings get featured placement so students see your property first.",
  },
  {
    badge: "Dedicated Support",
    title: "White-Glove Onboarding",
    desc: "We personally help early landlords set up their listing and optimize it for more views.",
  },
]

const faqs = [
  {
    q: "Are listings available now?",
    a: "Yes — listings are live right now. Browse them on the Listings page, no account required.",
  },
  {
    q: "Is CampusLease free?",
    a: "Browsing and messaging is always free for students. Landlords pay a fee to post a listing. Early landlords get a discounted rate.",
  },
  {
    q: "How do I list my property?",
    a: "Create a free account, click 'List Your Property', fill in the details and photos, and your listing goes live immediately.",
  },
  {
    q: "What makes CampusLease different from Zillow or Apartments.com?",
    a: "Those platforms are built for the general market. CampusLease is built specifically for students — semester-length leases, subletting, university filters, and a community that understands campus life.",
  },
  {
    q: "How do I know the landlords are legitimate?",
    a: "Every listing is reviewed before going live. We're a small team right now which means every landlord gets personal attention — no bots, no spam.",
  },
]

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-white">{q}</p>
        {open ? <ChevronUp size={16} className="shrink-0 text-orange-300" /> : <ChevronDown size={16} className="shrink-0 text-slate-400" />}
      </div>
      {open && <p className="mt-3 text-sm leading-relaxed text-slate-300">{a}</p>}
    </button>
  )
}

// ─── Landing ──────────────────────────────────────────────────────────────────

export function Landing() {
  const { data: properties = [] } = useProperties()
  const listingCount = properties.length
  const featured = properties[0] ?? null

  return (
    <>
      <SEO
        title="Student Housing Near Your Campus"
        description="CampusLease is the student-first housing marketplace. Find off-campus apartments, houses, and studios near your university — free to browse and message."
        url="/"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white">

        {/* ── Hero ── */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid gap-12 lg:grid-cols-2 lg:items-center"
          >
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-orange-400/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-orange-200">
                <Sparkles size={14} /> CampusLease — Live Now
              </div>
              <h1 className="text-5xl font-bold leading-tight md:text-6xl">
                Student Housing,<br />
                <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">Built for Campus.</span>
              </h1>
              <p className="text-lg text-slate-300">
                The housing marketplace designed specifically for college students. No clutter, no irrelevant listings — just rentals near your university, with direct messaging to landlords.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/map">Browse Listings <ArrowRight size={16} className="ml-1" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/create">List Your Property</Link>
                </Button>
              </div>
              <p className="text-sm text-slate-400">Free to browse · No account needed · {listingCount > 0 ? `${listingCount} listing${listingCount !== 1 ? "s" : ""} live` : "Listings live now"}</p>
            </div>

            {/* Right card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-orange-400/20 blur-3xl" />
              <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />
              {featured ? (
                <Link to={`/properties/${featured.id}`}>
                  <Card className="relative overflow-hidden border border-white/10 bg-white/10 backdrop-blur transition hover:border-white/20">
                    <CardContent className="space-y-4 py-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-orange-300">Latest Listing</p>
                      <img
                        src={featured.images[0] ?? "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop"}
                        alt={featured.title}
                        className="h-44 w-full rounded-xl object-cover"
                      />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white line-clamp-1">{featured.title}</p>
                          <p className="text-xs text-slate-400">{featured.city} · {featured.bedrooms}bd · {featured.bathrooms}ba</p>
                        </div>
                        <span className="rounded-full bg-gradient-to-r from-orange-400 to-amber-300 px-3 py-1.5 text-sm font-bold text-slate-900 shrink-0">
                          ${featured.price.toLocaleString()}/mo
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="relative overflow-hidden border border-white/10 bg-white/10 backdrop-blur">
                  <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                    <Building2 size={40} className="text-orange-300" />
                    <p className="font-semibold text-white">Be the first to list</p>
                    <p className="text-sm text-slate-400">Post your property and reach students near your campus.</p>
                    <Button asChild size="sm"><Link to="/create">List Your Property</Link></Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* ── Why CampusLease ── */}
        <section className="border-t border-white/5 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <p className="text-xs uppercase tracking-widest text-orange-300">Why Us</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">Why CampusLease over Zillow?</h2>
              <p className="mt-3 text-slate-400">Zillow is built for everyone. We're built for students.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {whyUs.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border border-white/10 bg-white/5">
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-400/15 text-orange-300">
                        <item.icon size={22} />
                      </div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6 space-y-16">
            {/* Renters */}
            <div>
              <div className="mb-10 text-center">
                <p className="text-xs uppercase tracking-widest text-orange-300">For Students</p>
                <h2 className="mt-2 text-3xl font-bold">Find a Place in 4 Steps</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-4">
                {renterSteps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="relative text-center"
                  >
                    {i < renterSteps.length - 1 && (
                      <div className="absolute right-0 top-6 hidden w-1/2 border-t border-dashed border-white/10 md:block" />
                    )}
                    <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-orange-400/30 bg-orange-400/10 text-orange-300">
                      <step.icon size={20} />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-slate-900">{i + 1}</span>
                    </div>
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Landlords */}
            <div>
              <div className="mb-10 text-center">
                <p className="text-xs uppercase tracking-widest text-orange-300">For Landlords</p>
                <h2 className="mt-2 text-3xl font-bold">Fill Your Vacancy in 4 Steps</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-4">
                {landlordSteps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="relative text-center"
                  >
                    {i < landlordSteps.length - 1 && (
                      <div className="absolute right-0 top-6 hidden w-1/2 border-t border-dashed border-white/10 md:block" />
                    )}
                    <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-purple-400/30 bg-purple-400/10 text-purple-300">
                      <step.icon size={20} />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-400 text-xs font-bold text-white">{i + 1}</span>
                    </div>
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Landlord Incentives ── */}
        <section className="border-t border-white/5 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <p className="text-xs uppercase tracking-widest text-orange-300">For Property Owners</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">List Early. Get More.</h2>
              <p className="mt-3 text-slate-400">We're rewarding the landlords who join first.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {landlordPerks.map((perk, i) => (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border border-white/10 bg-white/5">
                    <CardContent className="space-y-3 pt-6">
                      <span className="inline-block rounded-full bg-orange-400/15 px-3 py-1 text-xs font-semibold text-orange-300">
                        {perk.badge}
                      </span>
                      <h3 className="text-lg font-bold text-white">{perk.title}</h3>
                      <p className="text-sm text-slate-400">{perk.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button asChild size="lg">
                <Link to="/create">List Your Property Now <ArrowRight size={16} className="ml-1" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-10 text-center">
              <p className="text-xs uppercase tracking-widest text-orange-300">FAQ</p>
              <h2 className="mt-2 text-3xl font-bold">Common Questions</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="border-t border-white/5 py-20">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <Star size={32} className="mx-auto mb-4 text-orange-400" />
            <h2 className="text-3xl font-bold md:text-4xl">Ready to find your next place?</h2>
            <p className="mt-4 text-slate-400">Browse the platform, explore features, or list your property today.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/map">Explore the Platform</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/register">Create an Account</Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
