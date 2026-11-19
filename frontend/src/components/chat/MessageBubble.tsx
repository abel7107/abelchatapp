
import { Check, CheckCheck, Reply, Pencil } from 'lucide-react'
import type { ChatMessage } from './types'

type MessageBubbleProps = {
  message: ChatMessage
  replyToMessage?: ChatMessage
  onReply: (message: ChatMessage) => void
  onEdit: (message: ChatMessage) => void
  onJumpToMessage: (messageId: string) => void
}

function MessageBubble({
  message,
  replyToMessage,
  onReply,
  onEdit,
  onJumpToMessage,
}: MessageBubbleProps) {
  const isMine = message.sender === 'me'

  return (
    <div
      id={`message-${message.id}`}
      data-message-id={message.id}
      className={`group flex w-full ${
        isMine ? 'justify-end' : 'justify-start'
      }`}
    >
      <div className="flex items-center gap-1.5 max-w-[80%] sm:max-w-[65%]">

        {isMine && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Reply to message"
              onClick={() => onReply(message)}
              className="w-7 h-7 shrink-0 rounded-full text-secondary opacity-0 group-hover:opacity-100 hover:bg-surface-hover hover:text-accent transition"
            >
              <Reply size={15} className="mx-auto" />
            </button>

            <button
              type="button"
              title="Edit message"
              onClick={() => onEdit(message)}
              className="w-7 h-7 shrink-0 rounded-full text-secondary opacity-0 group-hover:opacity-100 hover:bg-surface-hover hover:text-accent transition"
            >
              <Pencil size={14} className="mx-auto" />
            </button>
          </div>
        )}

        <div
          className={`min-w-0 px-3 py-2 rounded-2xl ${
            isMine
              ? 'bg-accent text-white rounded-br-md'
              : 'bg-white border border-border text-primary rounded-bl-md'
          }`}
        >
          {replyToMessage && (
            <button
              type="button"
              onClick={() => onJumpToMessage(replyToMessage.id)}
              className={`w-full text-left mb-1.5 px-2.5 py-1.5 rounded-md border-l-[3px] transition ${
                isMine
                  ? 'bg-white/10 border-violet-200 hover:bg-white/20'
                  : 'bg-surface border-accent hover:bg-surface-hover'
              }`}
              title="Jump to original message"
            >
              <span
                className={`block text-[11px] font-semibold ${
                  isMine ? 'text-violet-100' : 'text-accent'
                }`}
              >
                {replyToMessage.sender === 'me' ? 'You' : 'Other user'}
              </span>

              <span
                className={`block text-[11px] truncate mt-0.5 ${
                  isMine ? 'text-violet-100' : 'text-secondary'
                }`}
              >
                {replyToMessage.text}
              </span>
            </button>
          )}

          <p className="text-[13px] leading-5 whitespace-pre-wrap break-words">
            {message.text}
          </p>

          <div
            className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
              isMine ? 'text-violet-100' : 'text-secondary'
            }`}
          >
            {message.edited && <span>Edited</span>}

            <span>{message.time}</span>

            {isMine && (
              <>
                {message.status === 'sent' && <Check size={12} />}

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

        {!isMine && (
          <button
            type="button"
            title="Reply to message"
            onClick={() => onReply(message)}
            className="w-7 h-7 shrink-0 rounded-full text-secondary opacity-0 group-hover:opacity-100 hover:bg-surface-hover hover:text-accent transition"
          >
            <Reply size={15} className="mx-auto" />
          </button>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
