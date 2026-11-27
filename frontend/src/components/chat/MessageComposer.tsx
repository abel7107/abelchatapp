
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

import {
  Paperclip,
  Smile,
  Send,
  Save,
  X,
  ContactRound,
} from 'lucide-react'

import type { ChatMessage } from './types'

type MessageComposerProps = {
  value: string
  onChange: (value: string) => void
  onSendMessage: (text: string) => void

  replyTo: ChatMessage | null
  onCancelReply: () => void

  editingMessage: ChatMessage | null
  onSaveEdit: (messageId: string, text: string) => void
  onCancelEdit: () => void

  onShareContact: () => void
}

function MessageComposer({
  value,
  onChange,
  onSendMessage,
  replyTo,
  onCancelReply,
  editingMessage,
  onSaveEdit,
  onCancelEdit,
  onShareContact,
}: MessageComposerProps) {
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] =
    useState(false)

  const attachmentMenuRef = useRef<HTMLDivElement>(null)

  // Close the attachment menu when clicking outside or pressing Escape.
  useEffect(() => {
    if (!isAttachmentMenuOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target as Node)
      ) {
        setIsAttachmentMenuOpen(false)
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAttachmentMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAttachmentMenuOpen])

  function handleSend() {
    const trimmedMessage = value.trim()

    if (!trimmedMessage) return

    if (editingMessage) {
      onSaveEdit(editingMessage.id, trimmedMessage)
    } else {
      onSendMessage(trimmedMessage)
    }

    onChange('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    handleSend()
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  function handleShareContact() {
    setIsAttachmentMenuOpen(false)
    onShareContact()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 sm:px-8 py-4 bg-white border-t border-border shrink-0"
    >
      <div className="max-w-4xl mx-auto">

        {/* Edit mode information */}
        {editingMessage && (
          <div className="flex items-center justify-between gap-3 mb-3 p-3 bg-accent-soft rounded-xl border-l-4 border-accent">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent">
                Editing message
              </p>

              <p className="text-sm text-secondary truncate mt-1">
                {editingMessage.text}
              </p>
            </div>

            <button
              type="button"
              onClick={onCancelEdit}
              title="Cancel editing"
              className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-secondary hover:bg-white hover:text-danger transition"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Reply information */}
        {replyTo && !editingMessage && (
          <div className="flex items-center justify-between gap-3 mb-3 p-3 bg-accent-soft rounded-xl border-l-4 border-accent">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent">
                Replying to {replyTo.sender === 'me' ? 'yourself' : 'message'}
              </p>

              <p className="text-sm text-secondary truncate mt-1">
                {replyTo.text}
              </p>
            </div>

            <button
              type="button"
              onClick={onCancelReply}
              title="Cancel reply"
              className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-secondary hover:bg-white hover:text-danger transition"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 bg-surface rounded-2xl border border-border p-2">

          {/* Attachment menu */}
          <div className="relative shrink-0" ref={attachmentMenuRef}>
            <button
              type="button"
              title="Attachments"
              aria-label="Open attachment menu"
              aria-haspopup="menu"
              aria-expanded={isAttachmentMenuOpen}
              onClick={() =>
                setIsAttachmentMenuOpen((isOpen) => !isOpen)
              }
              disabled={!!editingMessage}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-secondary hover:bg-surface-hover hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Paperclip size={20} />
            </button>

            {isAttachmentMenuOpen && (
              <div
                role="menu"
                aria-label="Attachment options"
                className="absolute bottom-full left-0 z-50 mb-3 w-52 rounded-xl border border-border bg-white p-2 shadow-xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleShareContact}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-primary transition hover:bg-surface"
                >
                  <ContactRound
                    size={19}
                    className="text-accent"
                  />

                  <span className="font-medium">
                    Share contact
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Message input */}
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              editingMessage
                ? 'Edit your message...'
                : 'Write a message...'
            }
            rows={1}
            className="flex-1 min-w-0 resize-none bg-transparent outline-none text-sm text-primary placeholder:text-secondary py-3 max-h-32"
          />

          <button
            type="button"
            title="Emoji"
            className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-secondary hover:bg-surface-hover hover:text-accent transition"
          >
            <Smile size={20} />
          </button>

          <button
            type="submit"
            disabled={!value.trim()}
            title={editingMessage ? 'Save changes' : 'Send message'}
            className="w-10 h-10 shrink-0 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {editingMessage ? (
              <Save size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <p className="text-[10px] text-secondary mt-2 text-center">
          Press Enter to {editingMessage ? 'save changes' : 'send'} · Shift + Enter for a new line
        </p>
      </div>
    </form>
  )
}

export default MessageComposer
