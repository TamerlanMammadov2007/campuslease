import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? ""
const FROM_EMAIL = "CampusLease <no-reply@campus-leases.com>"
const SITE_URL = "https://campus-leases.com"

type MessageRow = {
  id: string
  thread_id: string
  sender_name: string
  sender_email: string
  recipient_name: string
  recipient_email: string
  content: string
  property_title?: string | null
}

type WebhookPayload = {
  type: "INSERT"
  table: string
  record: MessageRow
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  let payload: WebhookPayload
  try {
    payload = await req.json() as WebhookPayload
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const msg = payload.record
  if (!msg?.recipient_email) {
    return new Response("Missing recipient email", { status: 400 })
  }

  const propertyLine = msg.property_title
    ? `<p style="color:#64748b;font-size:13px;margin:0 0 16px;">Re: <strong style="color:#1e293b;">${msg.property_title}</strong></p>`
    : ""

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
          <p style="color:#1e293b;font-size:15px;margin:0 0 8px;">
            Hi <strong>${msg.recipient_name}</strong>,
          </p>
          <p style="color:#64748b;font-size:14px;margin:0 0 20px;">
            <strong style="color:#1e293b;">${msg.sender_name}</strong> sent you a message on CampusLease.
          </p>
          ${propertyLine}
          <div style="background:#f8fafc;border-radius:12px;padding:20px;border-left:3px solid #f97316;margin-bottom:24px;">
            <p style="color:#334155;font-size:14px;margin:0;line-height:1.7;">${msg.content}</p>
          </div>
          <a href="${SITE_URL}/inbox/${msg.thread_id}"
             style="display:inline-block;background:linear-gradient(135deg,#f97316,#fbbf24);color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
            Reply in Inbox
          </a>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 16px;" />
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            You received this because someone messaged you on <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">campus-leases.com</a>.
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
      to: msg.recipient_email,
      subject: `${msg.sender_name} sent you a message on CampusLease`,
      html,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error("Resend error:", error)
    return new Response("Email failed", { status: 500 })
  }

  return new Response("OK", { status: 200 })
})
