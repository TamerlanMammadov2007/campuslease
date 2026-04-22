import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? ""
const FROM_EMAIL = "CampusLease <no-reply@campus-leases.com>"

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  let body: { to: string; subject: string; message: string }
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const { to, subject, message } = body
  if (!to || !subject || !message) {
    return new Response("Missing fields", { status: 400 })
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="background:#0f172a;font-family:sans-serif;padding:40px 0;margin:0;">
      <div style="max-width:520px;margin:0 auto;background:#1e293b;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#f97316,#fbbf24);padding:24px 32px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">CampusLease</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#e2e8f0;font-size:15px;white-space:pre-line;line-height:1.7;">${message}</p>
          <p style="color:#475569;font-size:12px;margin:24px 0 0;">
            This message was sent by the CampusLease team via <a href="https://campus-leases.com" style="color:#f97316;">campus-leases.com</a>.
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
    return new Response("Email failed", { status: 500 })
  }

  return new Response("OK", { status: 200 })
})
