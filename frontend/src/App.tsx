
import { useRef, useState } from 'react'

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
  // Stores the message currently selected for replying.
  const [replyingTo, setReplyingTo] =
    useState<ChatMessage | null>(null)

    // Stores the message currently being edited.
const [editingMessage, setEditingMessage] =
  useState<ChatMessage | null>(null)

// Stores the temporary text inside the edit composer.
const [editingText, setEditingText] = useState('')

  const [selectedChatId, setSelectedChatId] =
    useState<string | null>(null)

  const [lastActivityByChat, setLastActivityByChat] =
    useState<Record<string, number>>({})

  const [messagesByChat, setMessagesByChat] =
    useState<Record<string, ChatMessage[]>>(sampleMessages)

  const [drafts, setDrafts] = useState<Record<string, string>>({})

  // Stores how many unread messages each conversation has.
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({
    '1': 2,
    '2': 5,
    '3': 0,
    '4': 0,
    '5': 1,
  })

  // Stores each conversation's scroll position.
  const scrollPositions = useRef<Record<string, number>>({})

  const selectedChat = selectedChatId
    ? chatDetails[selectedChatId]
    : null

  const selectedMessages = selectedChatId
    ? messagesByChat[selectedChatId] ?? []
    : []

  // Called when the user opens a conversation.
  function handleSelectChat(chatId: string) {
    setSelectedChatId(chatId)

    // Clear any reply selected in the previous conversation.
    setReplyingTo(null)

    setEditingMessage(null)
    setEditingText('')

    // Opening a conversation marks its messages as read.
    setUnreadCounts((currentCounts) => ({
      ...currentCounts,
      [chatId]: 0,
    }))
  }

  // Saves the draft separately for each conversation.
  function handleDraftChange(value: string) {
    if (!selectedChatId) return

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [selectedChatId]: value,
    }))
  }
  // Starts editing an existing message.
function handleEditMessage(message: ChatMessage) {
  if (!selectedChatId) return

  // Editing and replying should not happen simultaneously.
  setReplyingTo(null)

  setEditingMessage(message)
  setEditingText(message.text)
}

// Saves the edited message.
function handleSaveEdit(messageId: string, text: string) {
  if (!selectedChatId) return

  setMessagesByChat((currentMessages) => ({
    ...currentMessages,
    [selectedChatId]: (
      currentMessages[selectedChatId] ?? []
    ).map((message) =>
      message.id === messageId
        ? {
            ...message,
            text,
            edited: true,
          }
        : message
    ),
  }))

  // Exit edit mode after saving.
  setEditingMessage(null)
  setEditingText('')
}

// Cancels editing without changing the original message.
function handleCancelEdit() {
  setEditingMessage(null)
  setEditingText('')
}
        // Deletes a message only from the current user's conversation view.
function handleDeleteForMe(message: ChatMessage) {
  if (!selectedChatId) return

  const confirmed = window.confirm(
    'Are you sure you want to delete this message for yourself?'
  )

  if (!confirmed) return

  setMessagesByChat((currentMessages) => ({
    ...currentMessages,
    [selectedChatId]: (
      currentMessages[selectedChatId] ?? []
    ).filter((item) => item.id !== message.id),
  }))

  // Close reply mode if this was the message being replied to.
  setReplyingTo((current) =>
    current?.id === message.id ? null : current
  )

  // Close edit mode if this was the message being edited.
  if (editingMessage?.id === message.id) {
    setEditingMessage(null)
    setEditingText('')
  }
}

// Deletes a message for everyone in the conversation.
function handleDeleteForEveryone(message: ChatMessage) {
  if (!selectedChatId) return

  // Only messages sent by the current user can be deleted for everyone.
  if (message.sender !== 'me') return

  const confirmed = window.confirm(
    'Are you sure you want to delete this message for everyone?'
  )

  if (!confirmed) return

  setMessagesByChat((currentMessages) => ({
    ...currentMessages,
    [selectedChatId]: (
      currentMessages[selectedChatId] ?? []
    ).map((item) =>
      item.id === message.id
        ? {
            ...item,
            text: '',
            edited: false,
            deletedForEveryone: true,
          }
        : item
    ),
  }))

  setReplyingTo((current) =>
    current?.id === message.id ? null : current
  )

  if (editingMessage?.id === message.id) {
    setEditingMessage(null)
    setEditingText('')
  }
}

// Starts replying and exits edit mode if necessary.
function handleReplyMessage(message: ChatMessage) {
  setEditingMessage(null)
  setEditingText('')
  setReplyingTo(message)
}

  // Sends a new message.
  function handleSendMessage(text: string) {
    if (!selectedChatId) return

    const chatId = selectedChatId
    const now = Date.now()
    const messageId = crypto.randomUUID()

    const newMessage: ChatMessage = {
      id: messageId,
      text,
      time: new Date(now).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      sender: 'me',
      status: 'sent',

      // Connects this message to the message being replied to.
      replyTo: replyingTo?.id,
    }

    // 1. Add the new message with "sent" status.
    setMessagesByChat((currentMessages) => ({
      ...currentMessages,
      [chatId]: [
        ...(currentMessages[chatId] ?? []),
        newMessage,
      ],
    }))

    // 2. Update the conversation's latest activity.
    setLastActivityByChat((currentActivity) => ({
      ...currentActivity,
      [chatId]: now,
    }))

    // 3. Simulate delivery after 1 second.
    setTimeout(() => {
      setMessagesByChat((currentMessages) => ({
        ...currentMessages,
        [chatId]: (currentMessages[chatId] ?? []).map((message) =>
          message.id === messageId
            ? { ...message, status: 'delivered' }
            : message
        ),
      }))
    }, 1000)

    // 4. Simulate the recipient reading after 5 seconds.
    setTimeout(() => {
      setMessagesByChat((currentMessages) => ({
        ...currentMessages,
        [chatId]: (currentMessages[chatId] ?? []).map((message) =>
          message.id === messageId
            ? { ...message, status: 'read' }
            : message
        ),
      }))
    }, 5000)

    // Clear the reply selection after sending.
    setReplyingTo(null)
  }

  // Temporary testing function: simulates a message from another user.
  function handleSimulateIncomingMessage() {
    const targetChatId =
      ['1', '2', '3', '4', '5'].find(
        (chatId) => chatId !== selectedChatId,
      ) ?? '1'

    const now = Date.now()

    const incomingMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: 'Hey! This is a simulated incoming message.',
      time: new Date(now).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      sender: 'other',
    }

    setMessagesByChat((currentMessages) => ({
      ...currentMessages,
      [targetChatId]: [
        ...(currentMessages[targetChatId] ?? []),
        incomingMessage,
      ],
    }))

    setLastActivityByChat((currentActivity) => ({
      ...currentActivity,
      [targetChatId]: now,
    }))

    // A message in another conversation increases its unread count.
    if (targetChatId !== selectedChatId) {
      setUnreadCounts((currentCounts) => ({
        ...currentCounts,
        [targetChatId]: (currentCounts[targetChatId] ?? 0) + 1,
      }))
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-app-bg text-primary flex">
      <NavigationRail />

      <ConversationSidebar
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        messagesByChat={messagesByChat}
        lastActivityByChat={lastActivityByChat}
        unreadCounts={unreadCounts}
        onSimulateIncomingMessage={handleSimulateIncomingMessage}
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
  onReply={handleReplyMessage}
  onEdit={handleEditMessage}
  onDeleteForMe={handleDeleteForMe}
  onDeleteForEveryone={handleDeleteForEveryone}
/>
        

           <MessageComposer
            value={
              editingMessage
                ? editingText
                : drafts[selectedChatId] ?? ''
            }
            onChange={
              editingMessage
                ? setEditingText
                : handleDraftChange
            }
            onSendMessage={handleSendMessage}
            replyTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            editingMessage={editingMessage}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
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
