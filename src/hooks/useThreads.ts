import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Message, MessageThread } from "@/data/types"
import { apiBase, fetchJson } from "@/lib/api"

type CreateThreadPayload = {
  propertyId?: string
  propertyTitle?: string
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
    queryFn: () => fetchJson<MessageThread[]>(`${apiBase}/threads`),
  })
}

export function useThread(threadId?: string) {
  return useQuery<MessageThread | undefined>({
    queryKey: ["thread", threadId],
    queryFn: () =>
      fetchJson<MessageThread | undefined>(`${apiBase}/threads/${threadId}`, undefined, {
        allow404: true,
      }),
    enabled: Boolean(threadId),
  })
}

export function useCreateThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateThreadPayload) =>
      fetchJson<MessageThread>(`${apiBase}/threads`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] })
      queryClient.setQueryData(["thread", thread.id], thread)
    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      fetchJson<Message>(`${apiBase}/threads/${payload.threadId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: payload.content }),
      }),
    onSuccess: (_message, variables) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] })
      queryClient.invalidateQueries({ queryKey: ["thread", variables.threadId] })
    },
  })
}

export function useMarkThreadRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (threadId: string) =>
      fetchJson<{ ok: boolean }>(`${apiBase}/threads/${threadId}/read`, {
        method: "POST",
      }),
    onSuccess: (_result, threadId) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] })
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] })
    },
  })
}
