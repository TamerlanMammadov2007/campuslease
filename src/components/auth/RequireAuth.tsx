import React from "react"
import { Navigate, useLocation } from "react-router-dom"

import { useApp } from "@/context/AppContext"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useApp()
  const location = useLocation()

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Checking your session...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
