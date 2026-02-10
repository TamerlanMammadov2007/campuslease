/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

import type { RoommateProfile } from "@/data/types"
import { supabase } from "@/lib/supabase"

type AppState = {
  favorites: string[]
  compareIds: string[]
  currentUserId: string
  currentUserEmail: string
  currentUserName: string
  isAuthenticated: boolean
  authLoading: boolean
  roommateProfile?: RoommateProfile
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
  setRoommateProfile: (profile: RoommateProfile) => Promise<void>
}

const AppContext = createContext<AppState | undefined>(undefined)

type ProfileRow = {
  id: string
  name: string
  email: string
}

type RoommateRow = {
  id: string
  user_id: string
  name: string
  age: number
  gender: string
  university: string
  major: string
  bio?: string | null
  photo?: string | null
  budget_min: number
  budget_max: number
  move_in_date: string
  preferred_locations: string[] | null
  sleep_schedule: string
  cleanliness: string
  noise: string
  guests: string
  smoking: string
  drinking: string
  pets: string
  study_habits: string
  social_level: string
  interests: string[] | null
}

const mapRoommateProfile = (row: RoommateRow): RoommateProfile => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  age: row.age,
  gender: row.gender,
  university: row.university,
  major: row.major,
  bio: row.bio ?? "",
  photo: row.photo ?? undefined,
  budgetMin: row.budget_min,
  budgetMax: row.budget_max,
  moveInDate: row.move_in_date,
  preferredLocations: row.preferred_locations ?? [],
  sleepSchedule: row.sleep_schedule as RoommateProfile["sleepSchedule"],
  cleanliness: row.cleanliness as RoommateProfile["cleanliness"],
  noise: row.noise as RoommateProfile["noise"],
  guests: row.guests as RoommateProfile["guests"],
  smoking: row.smoking as RoommateProfile["smoking"],
  drinking: row.drinking as RoommateProfile["drinking"],
  pets: row.pets as RoommateProfile["pets"],
  studyHabits: row.study_habits as RoommateProfile["studyHabits"],
  socialLevel: row.social_level as RoommateProfile["socialLevel"],
  interests: row.interests ?? [],
})

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ProfileRow | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [roommateProfile, setRoommateProfileState] =
    useState<RoommateProfile | undefined>(undefined)

  const loadUserState = async (user: User) => {
    const [{ data: profile }, { data: favoritesData }, { data: compareData }, { data: roommate }] =
      await Promise.all([
        supabase.from("profiles").select("id,name,email").eq("id", user.id).maybeSingle(),
        supabase.from("favorites").select("listing_id").eq("user_id", user.id),
        supabase.from("compare_items").select("listing_id").eq("user_id", user.id),
        supabase.from("roommate_profiles").select("*").eq("user_id", user.id).maybeSingle(),
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
    setRoommateProfileState(roommate ? mapRoommateProfile(roommate as RoommateRow) : undefined)
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
          setRoommateProfileState(undefined)
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
    setRoommateProfileState(undefined)
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
    } else if (compareIds.length < 4) {
      void supabase.from("compare_items").insert({ user_id: currentUser.id, listing_id: id })
    }
  }

  const clearCompare = () => {
    if (!currentUser) return
    setCompareIds([])
    void supabase.from("compare_items").delete().eq("user_id", currentUser.id)
  }

  const setRoommateProfile = async (profile: RoommateProfile) => {
    if (!currentUser) return
    const payload = {
      user_id: currentUser.id,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      university: profile.university,
      major: profile.major,
      bio: profile.bio,
      photo: profile.photo ?? null,
      budget_min: profile.budgetMin,
      budget_max: profile.budgetMax,
      move_in_date: profile.moveInDate,
      preferred_locations: profile.preferredLocations,
      sleep_schedule: profile.sleepSchedule,
      cleanliness: profile.cleanliness,
      noise: profile.noise,
      guests: profile.guests,
      smoking: profile.smoking,
      drinking: profile.drinking,
      pets: profile.pets,
      study_habits: profile.studyHabits,
      social_level: profile.socialLevel,
      interests: profile.interests,
    }
    const { error } = await supabase
      .from("roommate_profiles")
      .upsert(payload, { onConflict: "user_id" })
    if (error) throw error
    const { data: row } = await supabase
      .from("roommate_profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle()
    if (row) {
      setRoommateProfileState(mapRoommateProfile(row as RoommateRow))
    }
  }

  const value = {
    favorites,
    compareIds,
    currentUserId: currentUser?.id ?? "",
    currentUserEmail: currentUser?.email ?? "Not signed in",
    currentUserName: currentUser?.name ?? "Guest",
    isAuthenticated: Boolean(currentUser),
    authLoading,
    roommateProfile,
    login,
    resetPassword,
    register,
    logout,
    toggleFavorite,
    toggleCompare,
    clearCompare,
    setRoommateProfile,
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
