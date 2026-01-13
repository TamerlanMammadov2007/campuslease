import React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SectionHeader } from "@/components/SectionHeader"
import { supabase } from "@/lib/supabase"

export function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    void supabase.auth.signOut()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      const user = data.user
      if (!user) {
        throw new Error("Admin login failed.")
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin,email")
        .eq("id", user.id)
        .maybeSingle()
      if (!profile?.is_admin) {
        await supabase.auth.signOut()
        throw new Error("Admin access required.")
      }
      await supabase.from("admin_login_events").insert({
        user_id: user.id,
        email: profile.email,
        event_type: "login",
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
