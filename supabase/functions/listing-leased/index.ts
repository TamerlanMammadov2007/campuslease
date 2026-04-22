import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
const FROM_EMAIL = "CampusLease <no-reply@campus-leases.com>"
const SITE_URL = "https://campus-leases.com"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  if (!res.ok) console.error("Resend error:", await res.text())
}

function emailHtml(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
  <body style="background:#f1f5f9;font-family:sans-serif;padding:40px 16px;margin:0;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#f97316,#fbbf24);padding:24px 32px;">
        <p style="margin:0;font-size:22px;font-weight:800;color:#fff;">CampusLease</p>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Student Housing Marketplace</p>
      </div>
      <div style="padding:36px 32px;">${body}
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 16px;"/>
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">campus-leases.com</a>
        </p>
      </div>
    </div>
  </body></html>`
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  let payload: { record: { id: string; status: string; old_record?: { status: string } } }
  try {
    payload = await req.json()
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders })
  }

  const { record } = payload
  if (record.status !== "leased") {
    return new Response("Not leased", { status: 200, headers: corsHeaders })
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Get full listing details
  const { data: listing } = await sb.from("listings").select("*").eq("id", record.id).maybeSingle()
  if (!listing) return new Response("Listing not found", { status: 404, headers: corsHeaders })

  // Get applicants for this listing
  const { data: applicants } = await sb
    .from("applications")
    .select("applicant_name,applicant_email")
    .eq("listing_id", record.id)

  // Email the owner
  await sendEmail(
    listing.owner_email,
    `Your listing "${listing.title}" is now marked as leased`,
    emailHtml(`
      <p style="color:#1e293b;font-size:15px;margin:0 0 16px;">Hi <strong>${listing.owner_name}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 16px;">
        Your listing <strong>${listing.title}</strong> in ${listing.city} has been marked as <strong style="color:#10b981;">leased</strong>.
        It has been removed from the browse page.
      </p>
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0;">
        Congratulations on closing the deal!
      </p>
    `),
  )

  // Email each applicant
  for (const applicant of applicants ?? []) {
    await sendEmail(
      applicant.applicant_email,
      `Update on "${listing.title}"`,
      emailHtml(`
        <p style="color:#1e293b;font-size:15px;margin:0 0 16px;">Hi <strong>${applicant.applicant_name}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 16px;">
          The listing <strong>${listing.title}</strong> in ${listing.city} that you applied for has been marked as leased and is no longer available.
        </p>
        <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
          Don't worry — there are plenty of other great listings available.
        </p>
        <a href="${SITE_URL}/map" style="display:inline-block;background:linear-gradient(135deg,#f97316,#fbbf24);color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
          Browse More Listings
        </a>
      `),
    )
  }

  return new Response("OK", { status: 200, headers: corsHeaders })
})
