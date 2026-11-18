
import {
  Phone,
  Video,
  MoreVertical,
  Search,
} from 'lucide-react'

type ChatHeaderProps = {
  name: string
  initials: string
  isOnline: boolean
  isGroup?: boolean
}

function ChatHeader({
  name,
  initials,
  isOnline,
  isGroup = false,
}: ChatHeaderProps) {
  return (
    <header className="h-[76px] bg-white border-b border-border px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-bold text-sm shrink-0">
          {initials}
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-primary truncate">
            {name}
          </h2>

          <p className="text-xs text-secondary mt-1">
            {isGroup
              ? 'Group conversation'
              : isOnline
                ? 'Online'
                : 'Offline'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          title="Search messages"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-secondary hover:bg-surface hover:text-accent transition"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          title="Voice call"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-secondary hover:bg-surface hover:text-accent transition"
        >
          <Phone size={19} />
        </button>

        <button
          type="button"
          title="Video call"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-secondary hover:bg-surface hover:text-accent transition"
        >
          <Video size={20} />
        </button>

        <button
          type="button"
          title="More options"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-secondary hover:bg-surface hover:text-accent transition"
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </header>
  )
}

export default ChatHeader
