import React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SectionHeader } from "@/components/SectionHeader"
import { apiBase, fetchJson } from "@/lib/api"

export function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    fetchJson(`${apiBase}/admin/logout`, { method: "POST" }).catch(() => {
      // Ignore logout errors.
    })
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchJson(`${apiBase}/admin/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      toast.success("Admin access granted.")
      navigate("/admin", { replace: true })
      setTimeout(() => {
        window.location.href = "/admin"
      }, 50)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Admin login failed."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <Card className="w-full max-w-md border border-white/10 bg-white/5">
        <CardContent className="space-y-6">
          <SectionHeader
            eyebrow="Admin Access"
            title="Admin Login"
            subtitle="Restricted access to CampusLease admin tools."
          />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Log In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
