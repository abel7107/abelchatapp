
import { useLayoutEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import type { ChatMessage } from './types'

type MessageListProps = {
  messages: ChatMessage[]
  chatId: string
  savedScrollTop: number
  onScrollPositionChange: (scrollTop: number) => void
}

function MessageList({
  messages,
  chatId,
  savedScrollTop,
  onScrollPositionChange,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  // Restore the saved position when opening a conversation.
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const frameId = requestAnimationFrame(() => {
      container.scrollTop = savedScrollTop
    })

    return () => cancelAnimationFrame(frameId)
  }, [chatId])

  // Scroll down only when a new message is added.
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const container = containerRef.current
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  return (
    <div
      ref={containerRef}
      onScroll={(event) => {
        onScrollPositionChange(event.currentTarget.scrollTop)
      }}
      className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        <div className="flex justify-center mb-2">
          <span className="bg-white border border-border rounded-full px-4 py-1.5 text-xs text-secondary">
            Today
          </span>
        </div>

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}

        {messages.length === 0 && (
          <p className="text-center text-sm text-secondary py-10">
            No messages yet. Start the conversation!
          </p>
        )}
      </div>
    </div>
  )
}

export default MessageList
