
import { useState } from 'react'
import NavigationRail from './components/layout/NavigationRail'
import ConversationSidebar from './components/layout/ConversationSidebar'

function App() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-app-bg text-primary flex">
      <NavigationRail />

      <ConversationSidebar
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
      />

      <main className="flex-1 min-w-0 flex items-center justify-center">
        {selectedChatId ? (
          <div className="text-center max-w-md px-6">
            <div className="text-5xl mb-6">💬</div>
            <h1 className="text-2xl font-bold mb-3">
              Conversation selected
            </h1>
            <p className="text-secondary">
              Selected conversation ID: {selectedChatId}
            </p>
            <p className="text-secondary text-sm mt-2">
              The main chat panel will appear here next.
            </p>
          </div>
        ) : (
          <div className="text-center max-w-md px-6">
            <div className="text-6xl mb-6">💬</div>
            <h1 className="text-3xl font-bold mb-3">
              Welcome to Abelchat
            </h1>
            <p className="text-secondary leading-relaxed">
              Your conversations belong here.
              Select a conversation or start connecting
              with someone new.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
