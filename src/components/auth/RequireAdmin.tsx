import React from "react"
import { Navigate } from "react-router-dom"

import { apiBase, fetchJson } from "@/lib/api"

type AdminUser = {
  email: string
  role: string
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = React.useState<AdminUser | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    fetchJson<AdminUser | undefined>(`${apiBase}/admin/me`, undefined, {
      allow401: true,
    })
      .then((user) => {
        if (mounted) {
          setAdminUser(user ?? null)
          setLoading(false)
        }
      })
      .catch(() => {
        if (mounted) {
          setAdminUser(null)
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Checking admin access...
      </div>
    )
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
