
import {
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import {
  Paperclip,
  Smile,
  Send,
  X,
} from 'lucide-react'
import type { ChatMessage } from './types'

type MessageComposerProps = {
  value: string
  onChange: (value: string) => void
  onSendMessage: (text: string) => void
  replyTo: ChatMessage | null
  onCancelReply: () => void
}

function MessageComposer({
  value,
  onChange,
  onSendMessage,
  replyTo,
  onCancelReply,
}: MessageComposerProps) {
  function handleSend() {
    const trimmedMessage = value.trim()

    if (!trimmedMessage) return

    onSendMessage(trimmedMessage)
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

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 sm:px-8 py-4 bg-white border-t border-border shrink-0"
    >
      <div className="max-w-4xl mx-auto">
        {replyTo && (
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
          <button
            type="button"
            title="Attach file"
            className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-secondary hover:bg-surface-hover hover:text-accent transition"
          >
            <Paperclip size={20} />
          </button>

          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
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
            title="Send message"
            className="w-10 h-10 shrink-0 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Send size={18} />
          </button>
        </div>

        <p className="text-[10px] text-secondary mt-2 text-center">
          Press Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </form>
  )
}

export default MessageComposer
