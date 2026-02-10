import React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SectionHeader } from "@/components/SectionHeader"
import { supabase } from "@/lib/supabase"

export function ResetPassword() {
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [hasSession, setHasSession] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setHasSession(Boolean(data.session))
    }
    void init()
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setHasSession(Boolean(session))
      },
    )
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }
    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success("Password updated. You can log in now.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Password reset failed."
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
            eyebrow="Reset Access"
            title="Set a New Password"
            subtitle="Use the link from your email to update your password."
          />
          {!hasSession ? (
            <p className="text-sm text-slate-300">
              Open this page from the password reset email so we can verify your
              request.
            </p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
