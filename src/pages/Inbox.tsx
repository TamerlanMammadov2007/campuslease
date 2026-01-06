import { Link } from "react-router-dom"
import { Building2, MessageSquare } from "lucide-react"

import { SectionHeader } from "@/components/SectionHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useThreads } from "@/hooks/useThreads"

export function Inbox() {
  const { data: threads = [], isLoading } = useThreads()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-slate-200">
          <MessageSquare size={32} />
          <p>Loading conversations...</p>
        </CardContent>
      </Card>
    )
  }

  if (threads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-slate-200">
          <MessageSquare size={32} />
          <p>No conversations yet.</p>
          <Link className="text-orange-200" to="/browse">
            Start messaging property owners
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Inbox"
        title="Messages"
        subtitle="Stay on top of property tours and roommate conversations."
      />
      <div className="space-y-4">
        {threads.map((thread) => {
          const lastMessage = thread.messages[thread.messages.length - 1]
          const unread = thread.messages.filter((message) => !message.read)
            .length
          return (
            <Link key={thread.id} to={`/inbox/${thread.id}`}>
              <Card className="border border-white/10 bg-white/10 transition hover:border-orange-400/40">
                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-300 text-sm font-semibold text-slate-900">
                      {thread.participantName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {thread.participantName}
                      </p>
                      <p className="text-xs text-slate-300">
                        {thread.propertyTitle ? (
                          <span className="flex items-center gap-1">
                            <Building2 size={12} /> {thread.propertyTitle}
                          </span>
                        ) : (
                          "Roommate conversation"
                        )}
                      </p>
                      <p className="text-xs text-slate-400">
                        {lastMessage
                          ? `${lastMessage.sender === "You" ? "You: " : ""}${lastMessage.content}`
                          : "No messages yet."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    {unread ? <Badge variant="amber">{unread}</Badge> : null}
                    <span>
                      {lastMessage
                        ? new Date(lastMessage.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
