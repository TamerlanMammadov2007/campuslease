import { Helmet } from "react-helmet-async"

type SEOProps = {
  title?: string
  description?: string
  image?: string
  url?: string
}

const SITE = "CampusLease"
const BASE_URL = "https://campus-leases.com"
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`
const DEFAULT_DESC =
  "Find affordable student housing near your campus. Browse curated listings, compare properties, and connect with owners — all in one place."

export function SEO({ title, description, image, url }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE}` : `${SITE} — Student Housing Made Easy`
  const desc = description ?? DEFAULT_DESC
  const img = image ?? DEFAULT_IMAGE
  const canonical = url ? `${BASE_URL}${url}` : BASE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  )
}
