
import {
  MessageCircle,
  Phone,
  CircleDot,
  Users,
  Settings,
} from 'lucide-react'

function NavigationRail() {
  return (
    <aside className="w-[76px] h-screen bg-sidebar border-r border-border flex flex-col items-center py-5">

      {/* Abelchat logo */}
      <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center mb-10">
        <MessageCircle className="text-white" size={24} />
      </div>

      {/* Navigation items */}
      <nav className="flex flex-col items-center gap-5">

        <button
          title="Chats"
          className="w-11 h-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center"
        >
          <MessageCircle size={22} />
        </button>

        <button
          title="Calls"
          className="w-11 h-11 rounded-xl text-secondary hover:bg-surface hover:text-primary flex items-center justify-center transition"
        >
          <Phone size={22} />
        </button>

        <button
          title="Status"
          className="w-11 h-11 rounded-xl text-secondary hover:bg-surface hover:text-primary flex items-center justify-center transition"
        >
          <CircleDot size={22} />
        </button>

        <button
          title="Contacts"
          className="w-11 h-11 rounded-xl text-secondary hover:bg-surface hover:text-primary flex items-center justify-center transition"
        >
          <Users size={22} />
        </button>

      </nav>

      {/* Settings and profile */}
      <div className="mt-auto flex flex-col items-center gap-5">

        <button
          title="Settings"
          className="w-11 h-11 rounded-xl text-secondary hover:bg-surface hover:text-primary flex items-center justify-center transition"
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
