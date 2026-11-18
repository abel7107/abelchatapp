
import { Check, CheckCheck } from 'lucide-react'
import type { ChatMessage } from './types'

type MessageBubbleProps = {
  message: ChatMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isMine = message.sender === 'me'

  return (
    <div className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] px-4 py-3 rounded-2xl ${
          isMine
            ? 'bg-accent text-white rounded-br-md'
            : 'bg-white border border-border text-primary rounded-bl-md'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </p>

        <div
          className={`flex items-center justify-end gap-1 mt-2 text-[10px] ${
            isMine ? 'text-violet-100' : 'text-secondary'
          }`}
        >
          <span>{message.time}</span>

          {isMine && (
            <>
              {message.status === 'sent' && <Check size={13} />}

              {(message.status === 'delivered' ||
                message.status === 'read') && (
                <CheckCheck
                  size={14}
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
  )
}

export default MessageBubble
