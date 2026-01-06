import React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SectionHeader } from "@/components/SectionHeader"
import { useApp } from "@/context/AppContext"

export function Login() {
  const { login, isAuthenticated, authLoading } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/browse")
    }
  }, [authLoading, isAuthenticated, navigate])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email || !password) return
    setIsSubmitting(true)
    try {
      await login(email, password)
      toast.success("Welcome back!")
      const redirectTo =
        typeof location.state?.from === "string" ? location.state.from : "/browse"
      navigate(redirectTo)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed. Try again."
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
            eyebrow="Welcome Back"
            title="Log In"
            subtitle="Access saved listings, inbox, and profile settings."
          />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Log In"}
            </Button>
          </form>
          <p className="text-center text-xs text-slate-300">
            New here?{" "}
            <Link className="text-orange-200" to="/register">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
