
import { useLayoutEffect, useRef, useState } from 'react'
import { Pin, PinOff, ChevronDown } from 'lucide-react'
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
  onToggleStar: (message: ChatMessage) => void

  isTyping: boolean

  // Message search support
  searchQuery?: string
  searchTargetMessageId?: string | null
  onSearchTargetHandled?: () => void
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
  onToggleStar,
  isTyping,
  searchQuery = '',
  searchTargetMessageId = null,
  onSearchTargetHandled,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  const [isPinnedPanelOpen, setIsPinnedPanelOpen] = useState(false)

  // Find pinned messages in this conversation.
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

  // Jump to a message inside this conversation.
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

  // Jump to a message selected from the search results.
  useLayoutEffect(() => {
    if (!searchTargetMessageId) return

    const frameId = requestAnimationFrame(() => {
      handleJumpToMessage(searchTargetMessageId)
      onSearchTargetHandled?.()
    })

    return () => cancelAnimationFrame(frameId)
  }, [searchTargetMessageId])

  return (
    <div
      ref={containerRef}
      onScroll={(event) => {
        onScrollPositionChange(event.currentTarget.scrollTop)
      }}
      className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-4">

        {/* Pinned messages banner */}
        {latestPinnedMessage && (
          <div className="sticky top-0 z-20">
            <button
              type="button"
              onClick={() => {
                handleJumpToMessage(latestPinnedMessage.id)
              }}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm hover:bg-surface transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Pin size={17} className="text-accent shrink-0" />

                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold text-accent">
                    Pinned message
                  </p>

                  <p className="text-sm text-primary truncate">
                    {latestPinnedMessage.deletedForEveryone
                      ? 'This message was deleted'
                      : latestPinnedMessage.text}
                  </p>
                </div>
              </div>

              <ChevronDown
                size={18}
                className={`text-secondary shrink-0 transition-transform ${
                  isPinnedPanelOpen ? 'rotate-180' : ''
                }`}
                onClick={(event: React.MouseEvent<SVGSVGElement>) => {
                  event.stopPropagation()
                  setIsPinnedPanelOpen((current) => !current)
                }}
              />
            </button>

            {/* Expanded pinned messages panel */}
            {isPinnedPanelOpen && (
              <div className="mt-2 rounded-xl border border-border bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-primary">
                    Pinned messages ({pinnedMessages.length})
                  </h3>

                  <button
                    type="button"
                    onClick={() => setIsPinnedPanelOpen(false)}
                    className="text-xs text-secondary hover:text-accent"
                  >
                    Close
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {pinnedMessages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-center gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          handleJumpToMessage(message.id)
                          setIsPinnedPanelOpen(false)
                        }}
                        className="flex-1 min-w-0 text-left rounded-lg px-3 py-2 hover:bg-surface transition"
                      >
                        <p className="text-sm text-primary truncate">
                          {message.deletedForEveryone
                            ? 'This message was deleted'
                            : message.text}
                        </p>
                      </button>

                      <button
                        type="button"
                        title="Unpin message"
                        onClick={() => onTogglePin(message)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-secondary hover:bg-surface hover:text-accent transition"
                      >
                        <PinOff size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conversation messages */}
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
              onToggleStar={onToggleStar}
              highlightText={searchQuery}
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
