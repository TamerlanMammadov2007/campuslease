import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SectionHeader } from "@/components/SectionHeader"
import { useApp } from "@/context/AppContext"

export function Register() {
  const { register, isAuthenticated, authLoading } = useApp()
  const navigate = useNavigate()
  const [name, setName] = React.useState("")
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
    if (!name || !email || !password) return
    setIsSubmitting(true)
    try {
      await register(name, email, password)
      toast.success("Account created.")
      navigate("/browse")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed. Try again."
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
            eyebrow="Create Account"
            title="Join CampusLease"
            subtitle="Save favorites, message owners, and manage listings."
          />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-xs text-slate-300">
            Already have an account?{" "}
            <Link className="text-orange-200" to="/login">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
