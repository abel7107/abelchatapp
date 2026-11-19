
import { useRef, useState } from 'react'

import {
  Check,
  CheckCheck,
  Reply,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

import type { ChatMessage } from './types'

type MessageBubbleProps = {
  message: ChatMessage
  replyToMessage?: ChatMessage

  isSelected: boolean
  onSelect: (message: ChatMessage) => void

  onReply: (message: ChatMessage) => void
  onEdit: (message: ChatMessage) => void
  onDeleteForMe: (message: ChatMessage) => void
  onDeleteForEveryone: (message: ChatMessage) => void
  onJumpToMessage: (messageId: string) => void
}

function MessageBubble({
  message,
  replyToMessage,
  isSelected,
  onSelect,
  onReply,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onJumpToMessage,
}: MessageBubbleProps) {
  const isMine = message.sender === 'me'
  const isDeleted = message.deletedForEveryone === true

  const [showDeleteMenu, setShowDeleteMenu] = useState(false)

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggered = useRef(false)

  const actionButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-secondary transition hover:bg-surface-hover hover:text-accent'

  const stopLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handlePointerDown = () => {
    longPressTriggered.current = false

    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      onSelect(message)
    }, 500)
  }

  const handleClick = () => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }

    onSelect(message)
    setShowDeleteMenu(false)
  }

  const handleReply = () => {
    setShowDeleteMenu(false)
    onReply(message)
  }

  const handleEdit = () => {
    setShowDeleteMenu(false)
    onEdit(message)
  }

  const handleDeleteForMe = () => {
    setShowDeleteMenu(false)
    onDeleteForMe(message)
  }

  const handleDeleteForEveryone = () => {
    setShowDeleteMenu(false)
    onDeleteForEveryone(message)
  }

  return (
    <div
      id={`message-${message.id}`}
      data-message-id={message.id}
      className={`group flex w-full ${
        isMine ? 'justify-end' : 'justify-start'
      }`}
      onPointerDown={handlePointerDown}
      onPointerUp={stopLongPress}
      onPointerLeave={stopLongPress}
      onPointerCancel={stopLongPress}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="relative flex max-w-[80%] items-center gap-1.5 sm:max-w-[65%]">

        {/* Selection toolbar */}
        {isSelected && (
          <div
            className={`absolute -top-11 z-20 flex items-center gap-1 rounded-xl border border-border bg-white p-1 shadow-lg ${
              isMine ? 'right-0' : 'left-0'
            }`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            {!isDeleted && (
              <>
                <button
                  type="button"
                  title="Reply"
                  onClick={handleReply}
                  className={actionButtonClass}
                >
                  <Reply size={16} />
                </button>

                {isMine && (
                  <button
                    type="button"
                    title="Edit"
                    onClick={handleEdit}
                    className={actionButtonClass}
                  >
                    <Pencil size={15} />
                  </button>
                )}
              </>
            )}

            {/* One delete button */}
            <div className="relative">
              <button
                type="button"
                title="Delete"
                onClick={() => setShowDeleteMenu((previous) => !previous)}
                className={`${actionButtonClass} hover:text-danger`}
              >
                <Trash2 size={15} />
              </button>

              {/* Delete options */}
              {showDeleteMenu && (
                <div className="absolute top-10 left-0 z-30 min-w-44 overflow-hidden rounded-lg border border-border bg-white py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={handleDeleteForMe}
                    className="w-full px-3 py-2 text-left text-xs text-primary transition hover:bg-surface-hover"
                  >
                    Delete for me
                  </button>

                  {isMine && !isDeleted && (
                    <button
                      type="button"
                      onClick={handleDeleteForEveryone}
                      className="w-full px-3 py-2 text-left text-xs text-danger transition hover:bg-surface-hover"
                    >
                      Delete for everyone
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              title="Close selection"
              onClick={() => {
                setShowDeleteMenu(false)
                onSelect(message)
              }}
              className={actionButtonClass}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Message bubble */}
        <div
          onClick={handleClick}
          className={`min-w-0 cursor-pointer rounded-2xl px-3 py-2 transition ${
            isSelected ? 'ring-2 ring-accent ring-offset-2' : ''
          } ${
            isDeleted
              ? 'border border-border bg-surface text-secondary'
              : isMine
                ? 'rounded-br-md bg-accent text-white'
                : 'rounded-bl-md border border-border bg-white text-primary'
          }`}
        >
          {isDeleted ? (
            <p className="text-[13px] italic">
              This message was deleted
            </p>
          ) : (
            <>
              {/* Original message preview when replying */}
              {replyToMessage && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onJumpToMessage(replyToMessage.id)
                  }}
                  className={`mb-1.5 w-full rounded-md border-l-[3px] px-2.5 py-1.5 text-left transition ${
                    isMine
                      ? 'border-violet-200 bg-white/10 hover:bg-white/20'
                      : 'border-accent bg-surface hover:bg-surface-hover'
                  }`}
                  title="Jump to original message"
                >
                  <span
                    className={`block text-[11px] font-semibold ${
                      isMine ? 'text-violet-100' : 'text-accent'
                    }`}
                  >
                    {replyToMessage.sender === 'me'
                      ? 'You'
                      : 'Other user'}
                  </span>

                  <span
                    className={`mt-0.5 block truncate text-[11px] ${
                      isMine ? 'text-violet-100' : 'text-secondary'
                    }`}
                  >
                    {replyToMessage.deletedForEveryone
                      ? 'This message was deleted'
                      : replyToMessage.text}
                  </span>
                </button>
              )}

              <p className="whitespace-pre-wrap break-words text-[13px] leading-5">
                {message.text}
              </p>
            </>
          )}

          {/* Timestamp and delivery status */}
          <div
            className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
              isDeleted
                ? 'text-secondary'
                : isMine
                  ? 'text-violet-100'
                  : 'text-secondary'
            }`}
          >
            {!isDeleted && message.edited && (
              <span>Edited</span>
            )}

            <span>{message.time}</span>

            {!isDeleted && isMine && (
              <>
                {message.status === 'sent' && (
                  <Check size={12} />
                )}

                {(message.status === 'delivered' ||
                  message.status === 'read') && (
                  <CheckCheck
                    size={13}
                    className={
                      message.status === 'read'
                        ? 'text-violet-200'
                        : ''
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
