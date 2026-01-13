import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Message, MessageThread } from "@/data/types"
import { supabase } from "@/lib/supabase"

type CreateThreadPayload = {
  propertyId?: string
  propertyTitle?: string
  participantId?: string
  participantName: string
  participantEmail: string
  message: string
}

type SendMessagePayload = {
  threadId: string
  content: string
}

export function useThreads() {
  return useQuery<MessageThread[]>({
    queryKey: ["threads"],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw userError ?? new Error("Not authenticated.")
      const userId = userData.user.id
      const { data, error } = await supabase
        .from("threads")
        .select(
          "id,property_id,property_title,user_a_id,user_a_name,user_a_email,user_b_id,user_b_name,user_b_email,messages(id,thread_id,sender_id,sender_name,sender_email,recipient_id,recipient_name,recipient_email,content,created_at,read)",
        )
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => mapThread(row as ThreadRow, userId))
    },
  })
}

export function useThread(threadId?: string) {
  return useQuery<MessageThread | undefined>({
    queryKey: ["thread", threadId],
    queryFn: async () => {
      if (!threadId) return undefined
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw userError ?? new Error("Not authenticated.")
      const userId = userData.user.id
      const { data, error } = await supabase
        .from("threads")
        .select(
          "id,property_id,property_title,user_a_id,user_a_name,user_a_email,user_b_id,user_b_name,user_b_email,messages(id,thread_id,sender_id,sender_name,sender_email,recipient_id,recipient_name,recipient_email,content,created_at,read)",
        )
        .eq("id", threadId)
        .maybeSingle()
      if (error) throw error
      return data ? mapThread(data as ThreadRow, userId) : undefined
    },
    enabled: Boolean(threadId),
  })
}

export function useCreateThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateThreadPayload) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw userError ?? new Error("Not authenticated.")
      const userId = userData.user.id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name,email")
        .eq("id", userId)
        .maybeSingle()
      if (profileError || !profile) throw profileError ?? new Error("Profile not found.")

      let recipientId = ""
      let recipientName = payload.participantName
      let recipientEmail = payload.participantEmail
      if (payload.propertyId) {
        const { data: listing, error: listingError } = await supabase
          .from("listings")
          .select("owner_id,owner_name,owner_email")
          .eq("id", payload.propertyId)
          .maybeSingle()
        if (listingError || !listing) throw listingError ?? new Error("Listing not found.")
        recipientId = listing.owner_id
        recipientName = listing.owner_name
        recipientEmail = listing.owner_email
      } else if (payload.participantId) {
        recipientId = payload.participantId
        recipientName = payload.participantName
        recipientEmail = payload.participantEmail
      } else {
        throw new Error("Missing recipient information.")
      }

      const { data: threadRow, error: threadError } = await supabase
        .from("threads")
        .insert({
          property_id: payload.propertyId ?? null,
          property_title: payload.propertyTitle ?? null,
          user_a_id: userId,
          user_a_name: profile.name,
          user_a_email: profile.email,
          user_b_id: recipientId,
          user_b_name: recipientName,
          user_b_email: recipientEmail,
        })
        .select(
          "id,property_id,property_title,user_a_id,user_a_name,user_a_email,user_b_id,user_b_name,user_b_email",
        )
        .single()
      if (threadError) throw threadError

      const { error: messageError } = await supabase.from("messages").insert({
        thread_id: threadRow.id,
        sender_id: userId,
        sender_name: profile.name,
        sender_email: profile.email,
        recipient_id: recipientId,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        content: payload.message,
      })
      if (messageError) throw messageError

      return mapThread(
        {
          ...threadRow,
          messages: [],
        } as ThreadRow,
        userId,
      )
    },
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] })
      queryClient.setQueryData(["thread", thread.id], thread)
    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw userError ?? new Error("Not authenticated.")
      const userId = userData.user.id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name,email")
        .eq("id", userId)
        .maybeSingle()
      if (profileError || !profile) throw profileError ?? new Error("Profile not found.")
      const { data: thread, error: threadError } = await supabase
        .from("threads")
        .select("user_a_id,user_a_name,user_a_email,user_b_id,user_b_name,user_b_email")
        .eq("id", payload.threadId)
        .maybeSingle()
      if (threadError || !thread) throw threadError ?? new Error("Thread not found.")
      const recipient =
        thread.user_a_id === userId
          ? {
              id: thread.user_b_id,
              name: thread.user_b_name,
              email: thread.user_b_email,
            }
          : {
              id: thread.user_a_id,
              name: thread.user_a_name,
              email: thread.user_a_email,
            }
      const { data, error } = await supabase
        .from("messages")
        .insert({
          thread_id: payload.threadId,
          sender_id: userId,
          sender_name: profile.name,
          sender_email: profile.email,
          recipient_id: recipient.id,
          recipient_name: recipient.name,
          recipient_email: recipient.email,
          content: payload.content,
        })
        .select("*")
        .single()
      if (error) throw error
      return mapMessage(data as MessageRow, userId)
    },
    onSuccess: (_message, variables) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] })
      queryClient.invalidateQueries({ queryKey: ["thread", variables.threadId] })
    },
  })
}

export function useMarkThreadRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (threadId: string) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw userError ?? new Error("Not authenticated.")
      const userId = userData.user.id
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("thread_id", threadId)
        .eq("recipient_id", userId)
        .eq("read", false)
      if (error) throw error
      return { ok: true }
    },
    onSuccess: (_result, threadId) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] })
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] })
    },
  })
}

type MessageRow = {
  id: string
  thread_id: string
  sender_id: string
  sender_name: string
  sender_email: string
  recipient_id: string
  recipient_name: string
  recipient_email: string
  content: string
  created_at: string
  read: boolean
}

type ThreadRow = {
  id: string
  property_id?: string | null
  property_title?: string | null
  user_a_id: string
  user_a_name: string
  user_a_email: string
  user_b_id: string
  user_b_name: string
  user_b_email: string
  messages?: MessageRow[]
}

const mapMessage = (row: MessageRow, userId: string): Message => ({
  id: row.id,
  threadId: row.thread_id,
  sender: row.sender_id === userId ? "You" : row.sender_name,
  senderEmail: row.sender_email,
  recipient: row.recipient_name,
  recipientEmail: row.recipient_email,
  content: row.content,
  createdAt: row.created_at,
  read: row.read,
})

const mapThread = (row: ThreadRow, userId: string): MessageThread => {
  const isUserA = row.user_a_id === userId
  const participantName = isUserA ? row.user_b_name : row.user_a_name
  const participantEmail = isUserA ? row.user_b_email : row.user_a_email
  const messages = (row.messages ?? [])
    .map((message) => mapMessage(message, userId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  return {
    id: row.id,
    propertyId: row.property_id ?? undefined,
    propertyTitle: row.property_title ?? undefined,
    participantName,
    participantEmail,
    messages,
  }
}
