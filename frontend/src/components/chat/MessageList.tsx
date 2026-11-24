
import { useLayoutEffect, useRef, useState } from 'react'
import { Pin,PinOff ,ChevronDown } from 'lucide-react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import type { ChatMessage } from './types'

type MessageListProps = {
  messages: ChatMessage[]
  chatId: string
  savedScrollTop: number
  onScrollPositionChange: (scrollTop: number) => void

  selectedMessageId: string | null
  onSelectMessage: (message: ChatMessage) => void

  onReply: (message: ChatMessage) => void
  onForward: (message: ChatMessage) => void
  onEdit: (message: ChatMessage) => void
  onDeleteForMe: (message: ChatMessage) => void
  onDeleteForEveryone: (message: ChatMessage) => void

  onToggleReaction: (message: ChatMessage, emoji: string) => void

  onTogglePin: (message: ChatMessage) => void

  isTyping: boolean
}

function MessageList({
  messages,
  chatId,
  savedScrollTop,
  onScrollPositionChange,
  selectedMessageId,
  onSelectMessage,
  onReply,
  onForward,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onToggleReaction,
  onTogglePin,
  isTyping,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  const [isPinnedPanelOpen, setIsPinnedPanelOpen] = useState(false)
  // Find the most recently pinned message in this conversation.
const pinnedMessages = messages.filter(
  (message) => message.pinned && !message.deletedForEveryone,
)

const latestPinnedMessage =
  pinnedMessages[pinnedMessages.length - 1]

  // Restore the saved position when opening a conversation.
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const frameId = requestAnimationFrame(() => {
      container.scrollTop = savedScrollTop
    })

    return () => cancelAnimationFrame(frameId)
  }, [chatId])

  // Scroll down when messages or the typing indicator change.
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
  }, [messages, isTyping])

  function handleJumpToMessage(messageId: string) {
    const container = containerRef.current
    if (!container) return

    const originalMessage = container.querySelector(
      `[data-message-id="${messageId}"]`,
    )

    originalMessage?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  return (
    <div
      ref={containerRef}
      onScroll={(event) => {
        onScrollPositionChange(event.currentTarget.scrollTop)
      }}
      className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
       
{latestPinnedMessage && (
  <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
    {/* Pinned message banner */}
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-soft-violet text-accent">
        <Pin size={17} />
      </div>

      <button
        type="button"
        onClick={() => handleJumpToMessage(latestPinnedMessage.id)}
        className="min-w-0 flex-1 text-left"
        title="Jump to latest pinned message"
      >
        <p className="text-xs font-semibold text-accent">
          Pinned message · {pinnedMessages.length}
        </p>

        <p className="mt-0.5 truncate text-sm text-primary">
          {latestPinnedMessage.text}
        </p>
      </button>

      <button
        type="button"
        onClick={() =>
          setIsPinnedPanelOpen((previous) => !previous)
        }
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-secondary transition hover:bg-surface hover:text-accent"
        title={isPinnedPanelOpen ? 'Close pinned messages' : 'View all pinned messages'}
        aria-expanded={isPinnedPanelOpen}
      >
        <ChevronDown
          size={19}
          className={`transition-transform ${
            isPinnedPanelOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
    </div>

    {/* All pinned messages */}
    {isPinnedPanelOpen && (
      <div className="border-t border-border">
        <div className="px-4 py-2 text-xs font-semibold text-secondary">
          PINNED MESSAGES
        </div>

        <div className="max-h-64 overflow-y-auto">
          {pinnedMessages.map((message) => (
           <div
            key={message.id}
            className="flex items-start gap-2 border-t border-border px-4 py-3 transition hover:bg-surface"
          >
            <button
              type="button"
              onClick={() => handleJumpToMessage(message.id)}
              className="flex min-w-0 flex-1 items-start gap-3 text-left"
              title="Jump to message"
            >
              <Pin
                size={15}
                className="mt-0.5 shrink-0 text-accent"
              />

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-secondary">
                  {message.sender === 'me' ? 'You' : 'Other user'}
                  <span className="ml-2">{message.time}</span>
                </p>

                <p className="mt-1 break-words text-sm text-primary">
                  {message.text}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onTogglePin(message)}
              title="Unpin message"
              aria-label="Unpin message"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-secondary transition hover:bg-white hover:text-danger"
            >
              <PinOff size={15} />
            </button>
          </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
       
        <div className="flex justify-center mb-2">
          <span className="bg-white border border-border rounded-full px-4 py-1.5 text-xs text-secondary">
            Today
          </span>
        </div>

        {messages.map((message) => {
          const replyToMessage = message.replyTo
            ? messages.find(
                (item) => item.id === message.replyTo,
              )
            : undefined

          return (
            <MessageBubble
              key={message.id}
              message={message}
              replyToMessage={replyToMessage}
              isSelected={selectedMessageId === message.id}
              onSelect={onSelectMessage}
              onReply={onReply}
              onForward={onForward}
              onEdit={onEdit}
              onDeleteForMe={onDeleteForMe}
              onDeleteForEveryone={onDeleteForEveryone}
              onToggleReaction={onToggleReaction}
              onJumpToMessage={handleJumpToMessage}
              onTogglePin={onTogglePin}
            />
          )
        })}

        {messages.length === 0 && (
          <p className="text-center text-sm text-secondary py-10">
            No messages yet. Start the conversation!
          </p>
        )}

        <TypingIndicator isVisible={isTyping} />
      </div>
    </div>
  )
}

export default MessageList
