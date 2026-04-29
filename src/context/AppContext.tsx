/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

import { supabase } from "@/lib/supabase"

type AppState = {
  favorites: string[]
  compareIds: string[]
  currentUserId: string
  currentUserEmail: string
  currentUserName: string
  isAuthenticated: boolean
  authLoading: boolean
  login: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ requiresEmailConfirmation: boolean }>
  logout: () => Promise<void>
  toggleFavorite: (id: string) => void
  toggleCompare: (id: string) => void
  clearCompare: () => void
}

const AppContext = createContext<AppState | undefined>(undefined)

type ProfileRow = {
  id: string
  name: string
  email: string
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ProfileRow | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [compareIds, setCompareIds] = useState<string[]>([])

  const loadUserState = async (user: User) => {
    const [{ data: profile }, { data: favoritesData }, { data: compareData }] =
      await Promise.all([
        supabase.from("profiles").select("id,name,email").eq("id", user.id).maybeSingle(),
        supabase.from("favorites").select("listing_id").eq("user_id", user.id),
        supabase.from("compare_items").select("listing_id").eq("user_id", user.id),
      ])

    if (profile) {
      setCurrentUser(profile)
    } else {
      setCurrentUser({
        id: user.id,
        name: user.user_metadata?.name ?? "Guest",
        email: user.email ?? "Not signed in",
      })
    }
    setFavorites((favoritesData ?? []).map((row) => row.listing_id))
    setCompareIds((compareData ?? []).map((row) => row.listing_id))
  }

  useEffect(() => {
    let mounted = true
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      if (!mounted) return
      if (user) {
        await loadUserState(user)
      } else {
        setCurrentUser(null)
      }
      setAuthLoading(false)
    }
    void init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user
        if (!user) {
          setCurrentUser(null)
          setFavorites([])
          setCompareIds([])
          return
        }
        void loadUserState(user)
      },
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    if (error) throw error
  }

  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })
    if (error) throw error
    const requiresEmailConfirmation = !data.user?.email_confirmed_at
    if (requiresEmailConfirmation) {
      await supabase.auth.signOut()
    }
    return { requiresEmailConfirmation }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setFavorites([])
    setCompareIds([])
  }

  const toggleFavorite = (id: string) => {
    if (!currentUser) return
    const isFavorite = favorites.includes(id)
    setFavorites((prev) =>
      isFavorite ? prev.filter((item) => item !== id) : [...prev, id],
    )
    if (isFavorite) {
      void supabase.from("favorites").delete().eq("user_id", currentUser.id).eq("listing_id", id)
    } else {
      void supabase.from("favorites").insert({ user_id: currentUser.id, listing_id: id })
    }
  }

  const toggleCompare = (id: string) => {
    if (!currentUser) return
    const isCompared = compareIds.includes(id)
    const willAdd = !isCompared && compareIds.length < 4
    setCompareIds((prev) => {
      if (isCompared) {
        return prev.filter((item) => item !== id)
      }
      if (prev.length >= 4) {
        return prev
      }
      return [...prev, id]
    })
    if (isCompared) {
      void supabase
        .from("compare_items")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("listing_id", id)
    } else if (willAdd) {
      void supabase.from("compare_items").insert({ user_id: currentUser.id, listing_id: id })
    }
  }

  const clearCompare = () => {
    if (!currentUser) return
    setCompareIds([])
    void supabase.from("compare_items").delete().eq("user_id", currentUser.id)
  }

  const value = {
    favorites,
    compareIds,
    currentUserId: currentUser?.id ?? "",
    currentUserEmail: currentUser?.email ?? "Not signed in",
    currentUserName: currentUser?.name ?? "Guest",
    isAuthenticated: Boolean(currentUser),
    authLoading,
    login,
    resetPassword,
    register,
    logout,
    toggleFavorite,
    toggleCompare,
    clearCompare,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
