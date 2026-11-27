
import { MessageCircle, Star } from 'lucide-react'

export type StarredMessageItem = {
  chatId: string
  chatName: string
  chatInitials: string
  message: {
    id: string
    text: string
    time: string
    sender: 'me' | 'other'
  }
}

type StarredMessagesPageProps = {
  messages: StarredMessageItem[]
  onOpenMessage: (chatId: string, messageId: string) => void
  onUnstarMessage: (chatId: string, messageId: string) => void
}

function StarredMessagesPage({
  messages,
  onOpenMessage,
  onUnstarMessage,
}: StarredMessagesPageProps) {
  return (
    <main className="flex-1 min-w-0 h-screen overflow-y-auto bg-app-bg">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">

        {/* Page heading */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Star size={22} fill="currentColor" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-primary">
                Starred Messages
              </h1>
              <p className="text-sm text-secondary">
                Your saved messages from all conversations
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-secondary">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'} saved
          </p>
        </div>

        {/* Empty state */}
        {messages.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-border bg-white px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-secondary">
              <Star size={30} />
            </div>

            <h2 className="mb-2 text-lg font-semibold text-primary">
              No starred messages yet
            </h2>

            <p className="max-w-sm text-sm leading-relaxed text-secondary">
              Star important messages in your conversations
              and they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((item) => (
              <div
                key={`${item.chatId}-${item.message.id}`}
                className="rounded-2xl border border-border bg-white p-4 transition hover:border-accent/30"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                    {item.chatInitials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-primary">
                      {item.chatName}
                    </p>

                    <p className="text-xs text-secondary">
                      {item.message.sender === 'me' ? 'You' : item.chatName}
                      {' · '}
                      {item.message.time}
                    </p>
                  </div>

                  <button
                    type="button"
                    title="Unstar message"
                    aria-label="Unstar message"
                    onClick={() =>
                      onUnstarMessage(item.chatId, item.message.id)
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-accent transition hover:bg-accent-soft"
                  >
                    <Star size={18} fill="currentColor" />
                  </button>
                </div>

                <p className="mb-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-primary">
                  {item.message.text}
                </p>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenMessage(item.chatId, item.message.id)
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-xs font-medium text-accent transition hover:bg-accent hover:text-white"
                  >
                    <MessageCircle size={14} />
                    Open conversation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default StarredMessagesPage
