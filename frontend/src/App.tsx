
import { useRef,useState } from 'react'

import NavigationRail from './components/layout/NavigationRail'
import ConversationSidebar from './components/layout/ConversationSidebar'

import ChatHeader from './components/chat/ChatHeader'
import MessageList from './components/chat/MessageList'
import MessageComposer from './components/chat/MessageComposer'

import { sampleMessages } from './components/chat/sampleMessages'
import type { ChatMessage } from './components/chat/types'

const chatDetails: Record<
  string,
  {
    name: string
    initials: string
    isOnline: boolean
    isGroup: boolean
  }
> = {
  '1': {
    name: 'Abel',
    initials: 'AB',
    isOnline: true,
    isGroup: false,
  },
  '2': {
    name: 'Software Engineers',
    initials: 'SE',
    isOnline: false,
    isGroup: true,
  },
  '3': {
    name: 'Dawit',
    initials: 'DW',
    isOnline: false,
    isGroup: false,
  },
  '4': {
    name: 'Project Team',
    initials: 'PT',
    isOnline: false,
    isGroup: true,
  },
  '5': {
    name: 'Hana',
    initials: 'HN',
    isOnline: true,
    isGroup: false,
  },
}

function App() {
  const [selectedChatId, setSelectedChatId] =
    useState<string | null>(null)

    const [lastActivityByChat, setLastActivityByChat] =
  useState<Record<string, number>>({})

  const [messagesByChat, setMessagesByChat] =
    useState<Record<string, ChatMessage[]>>(sampleMessages)

  const [drafts, setDrafts] = useState<Record<string, string>>({})
    
  const scrollPositions = useRef<Record<string, number>>({})
  const selectedChat = selectedChatId
    ? chatDetails[selectedChatId]
    : null

  const selectedMessages = selectedChatId
    ? messagesByChat[selectedChatId] ?? []
    : []

  function handleDraftChange(value: string) {
    if (!selectedChatId) return

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [selectedChatId]: value,
    }))
  }

              function handleSendMessage(text: string) {
              if (!selectedChatId) return

              const now = Date.now()

              const newMessage: ChatMessage = {
                id: crypto.randomUUID(),
                text,
                time: new Date(now).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                sender: 'me',
                status: 'sent',
              }

              setMessagesByChat((currentMessages) => ({
                ...currentMessages,
                [selectedChatId]: [
                  ...(currentMessages[selectedChatId] ?? []),
                  newMessage,
                ],
              }))

              setLastActivityByChat((currentActivity) => ({
                ...currentActivity,
                [selectedChatId]: now,
              }))
            }
  return (
    <div className="h-screen overflow-hidden bg-app-bg text-primary flex">
      <NavigationRail />

      <ConversationSidebar
      selectedChatId={selectedChatId}
      onSelectChat={setSelectedChatId}
      messagesByChat={messagesByChat}
      lastActivityByChat={lastActivityByChat}
    />

      <main className="flex-1 min-w-0 flex flex-col bg-app-bg">
        {selectedChat && selectedChatId ? (
          <>
            <ChatHeader
              name={selectedChat.name}
              initials={selectedChat.initials}
              isOnline={selectedChat.isOnline}
              isGroup={selectedChat.isGroup}
            />

           <MessageList
              messages={selectedMessages}
              chatId={selectedChatId}
              savedScrollTop={scrollPositions.current[selectedChatId] ?? 0}
              onScrollPositionChange={(scrollTop) => {
                scrollPositions.current[selectedChatId] = scrollTop
              }}
            />

            <MessageComposer
              value={drafts[selectedChatId] ?? ''}
              onChange={handleDraftChange}
              onSendMessage={handleSendMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-3xl bg-accent-soft text-accent flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✦</span>
              </div>

              <h1 className="text-3xl font-bold mb-3">
                Welcome to Abelchat
              </h1>

              <p className="text-secondary leading-relaxed">
                Your conversations belong here.
                Select a conversation to start chatting.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
