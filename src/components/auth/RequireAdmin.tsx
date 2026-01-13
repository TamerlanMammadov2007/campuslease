import React from "react"
import { Navigate } from "react-router-dom"

import { supabase } from "@/lib/supabase"

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) {
        if (mounted) {
          setIsAdmin(false)
          setLoading(false)
        }
        return
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle()
      if (mounted) {
        setIsAdmin(Boolean(profile?.is_admin))
        setLoading(false)
      }
    }
    void checkAdmin()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void checkAdmin()
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Checking admin access...
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
