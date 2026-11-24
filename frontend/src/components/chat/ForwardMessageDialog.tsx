
import { useState } from 'react'
import { Forward, X } from 'lucide-react'
import type { ChatMessage } from './types'

export type ForwardConversation = {
  id: string
  name: string
  initials: string
}

type ForwardMessageDialogProps = {
  message: ChatMessage
  conversations: ForwardConversation[]
  onClose: () => void
  onForward: (conversationIds: string[]) => void
}

export default function ForwardMessageDialog({
  message,
  conversations,
  onClose,
  onForward,
}: ForwardMessageDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  function toggleConversation(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    )
  }

  function handleForward() {
    if (selectedIds.length === 0) return

    onForward(selectedIds)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="forward-dialog-title"
        className="w-full max-w-md rounded-2xl border border-border bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2
              id="forward-dialog-title"
              className="text-lg font-semibold text-primary"
            >
              Forward message
            </h2>
            <p className="text-sm text-secondary">
              Choose one or more conversations
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-secondary hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>
                 <div className="border-b border-border px-5 py-3">
          <p className="mb-1 text-xs font-medium text-secondary">
            MESSAGE PREVIEW
          </p>
          <div className="rounded-xl bg-surface p-3 text-sm text-primary">
            {message.text}
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto p-3">
          {conversations.length === 0 ? (
            <p className="p-4 text-center text-sm text-secondary">
              No other conversations available.
            </p>
          ) : (
            conversations.map((conversation) => {
              const isSelected = selectedIds.includes(conversation.id)

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => toggleConversation(conversation.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    isSelected ? 'bg-accent/10' : 'hover:bg-surface'
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-soft-violet font-semibold text-accent">
                    {conversation.initials}
                  </span>

                  <span className="flex-1 font-medium text-primary">
                    {conversation.name}
                  </span>

                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-accent bg-accent text-white'
                        : 'border-border'
                    }`}
                  >
                    {isSelected && '✓'}
                  </span>
                </button>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <span className="text-sm text-secondary">
            {selectedIds.length} selected
          </span>

          <button
            type="button"
            onClick={handleForward}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Forward size={16} />
            Forward
          </button>
        </div>
      </div>
    </div>
  )
}
