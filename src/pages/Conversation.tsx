import React from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { Breadcrumb } from "@/components/Breadcrumb"
import { SectionHeader } from "@/components/SectionHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMarkThreadRead, useSendMessage, useThread } from "@/hooks/useThreads"
import { useMarkAsLeased, useProperty } from "@/hooks/useProperties"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"

export function Conversation() {
  const { threadId } = useParams()
  const { data: thread, isLoading } = useThread(threadId)
  const { data: property } = useProperty(thread?.propertyId)
  const { mutateAsync: sendMessage } = useSendMessage()
  const { mutateAsync: markThreadRead } = useMarkThreadRead()
  const { mutateAsync: markAsLeased, isPending: isMarkingLeased } = useMarkAsLeased()
  const { currentUserId } = useApp()
  const [message, setMessage] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)
  const [showLeaseConfirm, setShowLeaseConfirm] = React.useState(false)
  const bottomRef = React.useRef<HTMLDivElement | null>(null)
  const queryClient = useQueryClient()

  React.useEffect(() => {
    if (threadId) {
      void markThreadRead(threadId)
    }
  }, [threadId, markThreadRead])

  React.useEffect(() => {
    if (!threadId) return
    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["thread", threadId] })
          queryClient.invalidateQueries({ queryKey: ["threads"] })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [threadId, queryClient])

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [thread?.messages.length])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-white">Loading conversation...</CardContent>
      </Card>
    )
  }

  if (!thread) {
    return (
      <Card>
        <CardContent className="text-white">Conversation not found.</CardContent>
      </Card>
    )
  }

  const handleSend = async () => {
    if (!message.trim()) return
    setIsSending(true)
    try {
      await sendMessage({
        threadId: thread.id,
        content: message,
      })
      setMessage("")
    } catch {
      toast.error("Failed to send message.")
    } finally {
      setIsSending(false)
    }
  }

  const handleMarkLeased = async () => {
    if (!property) return
    try {
      await markAsLeased(property.id)
      toast.success("Lease marked as signed. Listing removed from public view.")
      setShowLeaseConfirm(false)
    } catch {
      toast.error("Failed to mark lease as signed.")
    }
  }

  const isOwner = Boolean(property && currentUserId && property.ownerId === currentUserId)
  const alreadyLeased = property?.status === "leased"
  const ownerSent = thread.messages.some((m) => m.sender === "You")
  const otherSent = thread.messages.some((m) => m.sender !== "You")
  const canMarkLeased = isOwner && !alreadyLeased && ownerSent && otherSent

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Inbox", href: "/inbox" }, { label: thread.participantName }]} />
      <SectionHeader
        eyebrow="Conversation"
        title={thread.participantName}
        subtitle={thread.propertyTitle ?? "Direct thread"}
      />
      {alreadyLeased && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          This listing has been marked as leased. It is no longer visible publicly, but you can keep chatting here.
        </div>
      )}
      {canMarkLeased && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
          <span>Did you finalize the lease with {thread.participantName}?</span>
          <Button
            variant="secondary"
            onClick={() => setShowLeaseConfirm(true)}
            className="bg-orange-400 text-slate-900 hover:bg-orange-300"
          >
            Mark lease as signed
          </Button>
        </div>
      )}
      <Card className="border border-white/10 bg-white/10">
        <CardContent className="flex h-[500px] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {thread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "You" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                    msg.sender === "You"
                      ? "bg-slate-900 text-white"
                      : "bg-white/80 text-slate-900"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="mt-2 text-[10px] opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <Textarea
              placeholder="Write a message..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showLeaseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-6 text-white">
            <h3 className="text-lg font-semibold">Mark lease as signed?</h3>
            <p className="text-sm text-slate-300">
              This will remove "{property?.title ?? "this listing"}" from public search and the map.
              You can still continue chatting with {thread.participantName} here. This action cannot
              be undone from the chat.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowLeaseConfirm(false)}
                disabled={isMarkingLeased}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkLeased}
                disabled={isMarkingLeased}
                className="bg-orange-400 text-slate-900 hover:bg-orange-300"
              >
                {isMarkingLeased ? "Marking..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
