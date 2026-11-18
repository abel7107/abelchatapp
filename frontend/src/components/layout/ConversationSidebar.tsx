
import { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Filter,
  CheckCheck,
} from 'lucide-react'

type ChatPreview = {
  id: string
  name: string
  message: string
  time: string
  initials: string
  color: string
  unreadCount: number
  isGroup: boolean
  isOnline: boolean
}

type ConversationSidebarProps = {
  selectedChatId: string | null
  onSelectChat: (chatId: string) => void
}

const conversations: ChatPreview[] = [
  {
    id: '1',
    name: 'Abel',
    message: 'Hey! How is the project going?',
    time: '10:42',
    initials: 'AB',
    color: 'bg-emerald-600',
    unreadCount: 2,
    isGroup: false,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Software Engineers',
    message: 'Mekdes: I pushed the latest changes.',
    time: '09:35',
    initials: 'SE',
    color: 'bg-violet-600',
    unreadCount: 5,
    isGroup: true,
    isOnline: false,
  },
  {
    id: '3',
    name: 'Dawit',
    message: 'Thanks, see you tomorrow!',
    time: 'Yesterday',
    initials: 'DW',
    color: 'bg-sky-600',
    unreadCount: 0,
    isGroup: false,
    isOnline: false,
  },
  {
    id: '4',
    name: 'Project Team',
    message: 'You: Let us finish the design first.',
    time: 'Yesterday',
    initials: 'PT',
    color: 'bg-orange-600',
    unreadCount: 0,
    isGroup: true,
    isOnline: false,
  },
  {
    id: '5',
    name: 'Hana',
    message: 'Can you send me the document?',
    time: 'Monday',
    initials: 'HN',
    color: 'bg-pink-600',
    unreadCount: 1,
    isGroup: false,
    isOnline: true,
  },
]

type FilterType = 'all' | 'unread' | 'groups'

function ConversationSidebar({
  selectedChatId,
  onSelectChat,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filteredConversations = useMemo(() => {
    return conversations.filter((chat) => {
      const matchesSearch =
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.message.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'unread' && chat.unreadCount > 0) ||
        (activeFilter === 'groups' && chat.isGroup)

      return matchesSearch && matchesFilter
    })
  }, [searchQuery, activeFilter])

  return (
    <aside className="w-[360px] h-screen bg-sidebar border-r border-border flex flex-col shrink-0">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Chats
            </h1>
            <p className="text-xs text-secondary mt-1">
              Stay connected
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              title="Filter conversations"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-secondary hover:bg-surface hover:text-primary transition"
            >
              <Filter size={19} />
            </button>

            <button
              title="New conversation"
              className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition"
            >
              <Plus size={21} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="h-11 bg-surface border border-border rounded-xl flex items-center px-3 gap-3">
          <Search size={18} className="text-secondary shrink-0" />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search conversations..."
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-primary placeholder:text-secondary"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-4">
          {([
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'groups', label: 'Groups' },
          ] as const).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                activeFilter === filter.id
                  ? 'bg-accent-soft text-accent'
                  : 'bg-surface text-secondary hover:text-primary'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((chat) => {
            const isSelected = selectedChatId === chat.id

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition mb-1 ${
                  isSelected
                    ? 'bg-accent-soft border border-accent/20'
                    : 'hover:bg-surface border border-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className={`w-12 h-12 rounded-2xl ${chat.color} flex items-center justify-center text-white font-semibold text-sm`}
                  >
                    {chat.initials}
                  </div>

                  {chat.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-sidebar" />
                  )}
                </div>

                {/* Chat details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-primary truncate">
                      {chat.name}
                    </h3>

                    <span className="text-[10px] text-secondary shrink-0">
                      {chat.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-secondary truncate">
                      {chat.message.startsWith('You:') && (
                        <CheckCheck
                          size={13}
                          className="inline mr-1 text-accent"
                        />
                      )}
                      {chat.message}
                    </p>

                    {chat.unreadCount > 0 && (
                      <span className="min-w-5 h-5 px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        ) : (
          <div className="text-center py-12">
            <Search size={25} className="mx-auto text-secondary mb-3" />
            <p className="text-sm text-primary font-medium">
              No conversations found
            </p>
            <p className="text-xs text-secondary mt-1">
              Try another search or filter.
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}

export default ConversationSidebar
