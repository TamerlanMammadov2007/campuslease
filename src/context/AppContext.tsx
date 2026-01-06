/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react"

import { messageThreads } from "@/data/mock"
import type { MessageThread, Property, RoommateProfile } from "@/data/types"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { apiBase, fetchJson } from "@/lib/api"

type AppState = {
  favorites: string[]
  compareIds: string[]
  threads: MessageThread[]
  currentUserEmail: string
  currentUserName: string
  isAuthenticated: boolean
  authLoading: boolean
  roommateProfile?: RoommateProfile
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  toggleFavorite: (id: string) => void
  toggleCompare: (id: string) => void
  clearCompare: () => void
  addThread: (thread: MessageThread) => void
  sendMessage: (threadId: string, content: string) => void
  markThreadRead: (threadId: string) => void
  setRoommateProfile: (profile: RoommateProfile) => void
  addListing: (property: Property) => void
  updateListing: (property: Property) => void
  deleteListing: (id: string) => void
  listings: Property[]
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<{
    id: string
    name: string
    email: string
  } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    "campuslease:favorites",
    [],
  )
  const [compareIds, setCompareIds] = useLocalStorage<string[]>(
    "campuslease:compare",
    [],
  )
  const [threads, setThreads] = useLocalStorage<MessageThread[]>(
    "campuslease:threads",
    messageThreads,
  )
  const [roommateProfile, setRoommateProfile] =
    useLocalStorage<RoommateProfile | undefined>(
      "campuslease:roommateProfile",
      undefined,
    )
  const [listings, setListings] = useLocalStorage<Property[]>(
    "campuslease:listings",
    [],
  )

  useEffect(() => {
    let mounted = true
    fetchJson<{ id: string; name: string; email: string } | undefined>(
      `${apiBase}/auth/me`,
      undefined,
      { allow401: true },
    )
      .then((user) => {
        if (mounted) {
          setCurrentUser(user ?? null)
          setAuthLoading(false)
        }
      })
      .catch(() => {
        if (mounted) {
          setCurrentUser(null)
          setAuthLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    const user = await fetchJson<{ id: string; name: string; email: string }>(
      `${apiBase}/auth/login`,
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    )
    setCurrentUser(user)
  }

  const register = async (name: string, email: string, password: string) => {
    const user = await fetchJson<{ id: string; name: string; email: string }>(
      `${apiBase}/auth/register`,
      {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      },
    )
    setCurrentUser(user)
  }

  const addFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item !== id))
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      }
      if (prev.length >= 4) {
        return prev
      }
      return [...prev, id]
    })
  }

  const clearCompare = () => {
    setCompareIds([])
  }

  const addThread = (thread: MessageThread) => {
    setThreads((prev) => [thread, ...prev])
  }

  const sendMessage = (threadId: string, content: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              messages: [
                ...thread.messages,
                {
                  id: `msg-${Date.now()}`,
                  threadId,
                  sender: "You",
                  senderEmail: "you@campuslease.com",
                  recipient: thread.participantName,
                  recipientEmail: thread.participantEmail,
                  content,
                  createdAt: new Date().toISOString(),
                  read: true,
                },
              ],
            }
          : thread,
      ),
    )
  }

  const markThreadRead = (threadId: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              messages: thread.messages.map((message) => ({
                ...message,
                read: true,
              })),
            }
          : thread,
      ),
    )
  }

  const addListing = (property: Property) => {
    setListings((prev) => [property, ...prev])
  }

  const updateListing = (property: Property) => {
    setListings((prev) =>
      prev.map((item) => (item.id === property.id ? property : item)),
    )
  }

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id))
  }

  const logout = async () => {
    try {
      await fetchJson(`${apiBase}/auth/logout`, { method: "POST" })
    } catch {
      // Ignore logout errors.
    }
    setCurrentUser(null)
    setFavorites([])
    setCompareIds([])
    setThreads([])
    setRoommateProfile(undefined)
    setListings([])
  }

  const value = {
    favorites,
    compareIds,
    threads,
    currentUserEmail: currentUser?.email ?? "Not signed in",
    currentUserName: currentUser?.name ?? "Guest",
    isAuthenticated: Boolean(currentUser),
    authLoading,
    roommateProfile,
    login,
    register,
    logout,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    toggleCompare,
    clearCompare,
    addThread,
    sendMessage,
    markThreadRead,
    setRoommateProfile,
    addListing,
    updateListing,
    deleteListing,
    listings,
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
