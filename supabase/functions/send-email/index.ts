import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? ""
const FROM_EMAIL = "CampusLease <no-reply@campus-leases.com>"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders })
  }

  let body: { to: string; subject: string; message: string }
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders })
  }

  const { to, subject, message } = body
  if (!to || !subject || !message) {
    return new Response("Missing fields", { status: 400, headers: corsHeaders })
  }

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
          <p style="color:#1e293b;font-size:15px;white-space:pre-line;line-height:1.8;margin:0 0 24px;">${message}</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            Sent by the CampusLease team · <a href="https://campus-leases.com" style="color:#f97316;text-decoration:none;">campus-leases.com</a>
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
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error("Resend error:", error)
    return new Response("Email failed", { status: 500, headers: corsHeaders })
  }

  return new Response("OK", { status: 200, headers: corsHeaders })
})
