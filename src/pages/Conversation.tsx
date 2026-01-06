import React from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

import { SectionHeader } from "@/components/SectionHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMarkThreadRead, useSendMessage, useThread } from "@/hooks/useThreads"

export function Conversation() {
  const { threadId } = useParams()
  const { data: thread, isLoading } = useThread(threadId)
  const { mutateAsync: sendMessage } = useSendMessage()
  const { mutateAsync: markThreadRead } = useMarkThreadRead()
  const [message, setMessage] = React.useState("")
  const bottomRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (threadId) {
      void markThreadRead(threadId)
    }
  }, [threadId, markThreadRead])

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
    try {
      await sendMessage({
        threadId: thread.id,
        content: message,
      })
      setMessage("")
    } catch {
      toast.error("Failed to send message.")
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Conversation"
        title={thread.participantName}
        subtitle={thread.propertyTitle ?? "Roommate thread"}
      />
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
            <Button onClick={handleSend}>Send Message</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
