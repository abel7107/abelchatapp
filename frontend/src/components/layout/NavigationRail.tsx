
import {
  MessageCircle,
  Phone,
  CircleDot,
  Users,
  Settings,
} from 'lucide-react'

type NavigationPage = 'chats' | 'calls' | 'status' | 'contacts' | 'settings'

type NavigationRailProps = {
  activePage: NavigationPage
  onNavigate: (page: NavigationPage) => void
}

function NavigationRail({
  activePage,
  onNavigate,
}: NavigationRailProps) {
  const navigationItems = [
    {
      id: 'chats' as const,
      label: 'Chats',
      icon: MessageCircle,
    },
    {
      id: 'calls' as const,
      label: 'Calls',
      icon: Phone,
    },
    {
      id: 'status' as const,
      label: 'Status',
      icon: CircleDot,
    },
    {
      id: 'contacts' as const,
      label: 'Contacts',
      icon: Users,
    },
  ]

  return (
    <aside className="w-[76px] h-screen bg-sidebar border-r border-border flex flex-col items-center py-5">

      {/* Abelchat logo */}
      <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center mb-10">
        <MessageCircle className="text-white" size={24} />
      </div>

      {/* Navigation items */}
      <nav className="flex flex-col items-center gap-5">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id

          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
                isActive
                  ? 'bg-accent-soft text-accent'
                  : 'text-secondary hover:bg-surface hover:text-primary'
              }`}
            >
              <Icon size={22} />
            </button>
          )
        })}
      </nav>

      {/* Settings and profile */}
      <div className="mt-auto flex flex-col items-center gap-5">

        <button
          type="button"
          title="Settings"
          aria-label="Settings"
          aria-current={activePage === 'settings' ? 'page' : undefined}
          onClick={() => onNavigate('settings')}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
            activePage === 'settings'
              ? 'bg-accent-soft text-accent'
              : 'text-secondary hover:bg-surface hover:text-primary'
          }`}
        >
          <Settings size={22} />
        </button>

        <div
          title="Your profile"
          className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-sm font-bold text-accent"
        >
          A
        </div>

      </div>
    </aside>
  )
}

export default NavigationRail
