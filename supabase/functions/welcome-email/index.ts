import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? ""
const FROM_EMAIL = "CampusLease <no-reply@campus-leases.com>"
const SITE_URL = "https://campus-leases.com"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  let payload: { record: { name?: string; email: string } }
  try {
    payload = await req.json()
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders })
  }

  const { name, email } = payload.record
  if (!email) return new Response("Missing email", { status: 400, headers: corsHeaders })

  const firstName = name?.split(" ")[0] ?? "there"

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="background:#f1f5f9;font-family:sans-serif;padding:40px 16px;margin:0;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#f97316,#fbbf24);padding:24px 32px;">
          <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">CampusLease</p>
          <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Student Housing Marketplace</p>
        </div>
        <div style="padding:36px 32px;">
          <p style="color:#1e293b;font-size:18px;font-weight:700;margin:0 0 12px;">Welcome, ${firstName}!</p>
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
            You're now part of CampusLease — the easiest way to find student housing near your university.
          </p>
          <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
            Here's what you can do:
          </p>
          <ul style="color:#475569;font-size:14px;line-height:2;margin:0 0 28px;padding-left:20px;">
            <li>Browse listings near your university</li>
            <li>Message property owners directly</li>
            <li>Save your favorite listings</li>
            <li>Post your own property to rent</li>
          </ul>
          <a href="${SITE_URL}/map"
             style="display:inline-block;background:linear-gradient(135deg,#f97316,#fbbf24);color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
            Browse Listings
          </a>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 16px;" />
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            You're receiving this because you signed up at <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">campus-leases.com</a>.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to CampusLease, ${firstName}!`,
      html,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error("Resend error:", error)
    return new Response("Email failed", { status: 500, headers: corsHeaders })
  }

  return new Response("OK", { status: 200, headers: corsHeaders })
})
