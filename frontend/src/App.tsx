
import { useEffect, useRef, useState } from 'react'

import NavigationRail from './components/layout/NavigationRail'
import ConversationSidebar from './components/layout/ConversationSidebar'

import ChatHeader from './components/chat/ChatHeader'
import MessageList from './components/chat/MessageList'
import MessageComposer from './components/chat/MessageComposer'
import StarredMessagesPage from './components/chat/StarredMessagesPage'

import { sampleMessages } from './components/chat/sampleMessages'
import type { ChatMessage } from './components/chat/types'
import ContactsPage from './components/contacts/ContactsPage'
import type { Contact } from './components/contacts/types'
import ForwardMessageDialog from './components/chat/ForwardMessageDialog'
import ShareContactDialog from './components/chat/ShareContactDialog'
import { sampleContacts } from './components/contacts/sampleContacts'
type ChatDetails = {
  name: string
  initials: string
  isOnline: boolean
  isGroup: boolean
}

const initialChatDetails: Record<string, ChatDetails> = {
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

type NavigationPage =
  | 'chats'
  | 'calls'
  | 'status'
  | 'contacts'
  | 'starred'
  | 'settings'

function App() {
  // Stores the message currently selected for replying.
  const [replyingTo, setReplyingTo] =
    useState<ChatMessage | null>(null)

  // Stores the message currently being edited.
  const [editingMessage, setEditingMessage] =
    useState<ChatMessage | null>(null)

  // Stores the temporary text inside the edit composer.
  const [editingText, setEditingText] = useState('')

  //
  const [isShareContactOpen, setIsShareContactOpen] = useState(false)

  // Stores the message currently selected for forwarding.
  const [messageToForward, setMessageToForward] =
    useState<ChatMessage | null>(null)

  // Stores the ID of the currently selected message.
  const [selectedMessageId, setSelectedMessageId] =
    useState<string | null>(null)

  const [selectedChatId, setSelectedChatId] =
    useState<string | null>(null)

  // Stores conversation details dynamically.
  const [chatDetails, setChatDetails] =
    useState<Record<string, ChatDetails>>(initialChatDetails)

  const [lastActivityByChat, setLastActivityByChat] =
    useState<Record<string, number>>({})

  const [messagesByChat, setMessagesByChat] =
    useState<Record<string, ChatMessage[]>>(sampleMessages)

  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const [activePage, setActivePage] =
    useState<NavigationPage>('chats')

  // Message search state.
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTargetMessageId, setSearchTargetMessageId] =
    useState<string | null>(null)

  // Stores unread message counts.
  const [unreadCounts, setUnreadCounts] = useState<
    Record<string, number>
  >({
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

  // Collect all starred messages from every conversation.
  const starredMessages = Object.entries(messagesByChat).flatMap(
    ([chatId, messages]) =>
      messages
        .filter(
          (message) =>
            message.starred &&
            !message.deletedForEveryone,
        )
        .map((message) => ({
          chatId,
          chatName:
            chatDetails[chatId]?.name ?? 'Unknown conversation',
          chatInitials:
            chatDetails[chatId]?.initials ?? '?',
          message: {
            id: message.id,
            text: message.text,
            time: message.time,
            sender: message.sender,
          },
        })),
  )

  // Find messages matching the current search query.
  const searchResults = searchQuery.trim()
    ? selectedMessages.filter(
        (message) =>
          !message.deletedForEveryone &&
          message.text
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase()),
      )
    : []

  const [isTypingPreview, setIsTypingPreview] = useState(false)

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Select a message. Clicking the same message again deselects it.
  function handleSelectMessage(message: ChatMessage) {
    setSelectedMessageId((currentId) =>
      currentId === message.id ? null : message.id,
    )

    setIsTypingPreview(false)

    if (typingTimer.current) {
      clearTimeout(typingTimer.current)
    }
  }

  // Clear selection when clicking outside messages or pressing Escape.
  useEffect(() => {
    if (!selectedMessageId) return

    function handleOutsidePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Element)) return

      // Interactions inside a message must not clear its selection.
      if (target.closest('[data-message-id]')) return

      setSelectedMessageId(null)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedMessageId(null)
      }
    }

    document.addEventListener(
      'pointerdown',
      handleOutsidePointerDown,
    )

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener(
        'pointerdown',
        handleOutsidePointerDown,
      )

      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedMessageId])

  // Called when the user opens a conversation.
  function handleSelectChat(chatId: string) {
    setSelectedChatId(chatId)
    setSelectedMessageId(null)

    // Clear search state when switching conversations.
    setIsSearchOpen(false)
    setSearchQuery('')
    setSearchTargetMessageId(null)

    // Clear any reply or edit from the previous conversation.
    setReplyingTo(null)
    setEditingMessage(null)
    setEditingText('')

    // Opening a conversation marks its messages as read.
    setUnreadCounts((currentCounts) => ({
      ...currentCounts,
      [chatId]: 0,
    }))
  }

  // Called when the user clicks Message on a contact.
  function handleMessageContact(contact: Contact) {
    // Check whether a conversation with this contact already exists.
    const existingChatId = Object.entries(chatDetails).find(
      ([, chat]) =>
        !chat.isGroup &&
        chat.name.toLowerCase() === contact.name.toLowerCase(),
    )?.[0]

    // Open the existing conversation if one is found.
    if (existingChatId) {
      setActivePage('chats')
      handleSelectChat(existingChatId)
      return
    }

    // Otherwise, create a new conversation ID.
    const newChatId = crypto.randomUUID()

    // Add the contact's details to our chat records.
    setChatDetails((currentDetails) => ({
      ...currentDetails,
      [newChatId]: {
        name: contact.name,
        initials: contact.initials,
        isOnline: contact.isOnline,
        isGroup: false,
      },
    }))

    // Prepare an empty message history for this chat.
    setMessagesByChat((currentMessages) => ({
      ...currentMessages,
      [newChatId]: [],
    }))

    // Initialize the unread count.
    setUnreadCounts((currentCounts) => ({
      ...currentCounts,
      [newChatId]: 0,
    }))

    // Give the new conversation a recent activity timestamp.
    setLastActivityByChat((currentActivity) => ({
      ...currentActivity,
      [newChatId]: Date.now(),
    }))

    // Navigate to Chats and open the new conversation.
    setActivePage('chats')
    handleSelectChat(newChatId)
  }

  // Saves the draft separately for each conversation.
  function handleDraftChange(value: string) {
    if (!selectedChatId) return

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [selectedChatId]: value,
    }))
  }

  // Updates the composer and previews the typing indicator.
  function handleComposerChange(value: string) {
    if (editingMessage) {
      setEditingText(value)
    } else {
      handleDraftChange(value)
    }

    setIsTypingPreview(value.trim().length > 0)

    if (typingTimer.current) {
      clearTimeout(typingTimer.current)
    }

    if (value.trim()) {
      typingTimer.current = setTimeout(() => {
        setIsTypingPreview(false)
      }, 1500)
    }
  }

  // Starts editing an existing message.
  function handleEditMessage(message: ChatMessage) {
    if (!selectedChatId) return

    setSelectedMessageId(null)

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
          : message,
      ),
    }))

    // Exit edit mode after saving.
    setEditingMessage(null)
    setEditingText('')
    setSelectedMessageId(null)
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
      'Are you sure you want to delete this message for yourself?',
    )

    if (!confirmed) return

    setMessagesByChat((currentMessages) => ({
      ...currentMessages,
      [selectedChatId]: (
        currentMessages[selectedChatId] ?? []
      ).filter((item) => item.id !== message.id),
    }))

    setSelectedMessageId(null)

    // Close reply mode if this was the message being replied to.
    setReplyingTo((current) =>
      current?.id === message.id ? null : current,
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
      'Are you sure you want to delete this message for everyone?',
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
          : item,
      ),
    }))

    setSelectedMessageId(null)

    setReplyingTo((current) =>
      current?.id === message.id ? null : current,
    )

    if (editingMessage?.id === message.id) {
      setEditingMessage(null)
      setEditingText('')
    }
  }

  // Starts replying and exits edit mode if necessary.
  function handleReplyMessage(message: ChatMessage) {
    setSelectedMessageId(null)
    setEditingMessage(null)
    setEditingText('')
    setReplyingTo(message)
  }

  // Opens the forwarding workflow for a selected message.
  function handleForwardMessage(message: ChatMessage) {
    if (message.deletedForEveryone) return

    setSelectedMessageId(null)
    setReplyingTo(null)
    setEditingMessage(null)
    setEditingText('')

    setMessageToForward(message)
  }

  // Sends a copy of the selected message to each chosen conversation.
  function handleConfirmForward(conversationIds: string[]) {
    if (!messageToForward) return

    const now = Date.now()

    // Create a separate forwarded message for each destination.
    const forwardedMessages = conversationIds.map((chatId) => ({
      chatId,
      message: {
        id: crypto.randomUUID(),
        text: messageToForward.text,
        time: new Date(now).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sender: 'me' as const,
        status: 'sent' as const,
        forwarded: true,
      },
    }))

    // Add each forwarded message to its destination conversation.
    setMessagesByChat((currentMessages) => {
      const updatedMessages = { ...currentMessages }

      forwardedMessages.forEach(({ chatId, message }) => {
        updatedMessages[chatId] = [
          ...(updatedMessages[chatId] ?? []),
          message,
        ]
      })

      return updatedMessages
    })

    // Update activity for every destination conversation.
    setLastActivityByChat((currentActivity) => {
      const updatedActivity = { ...currentActivity }

      conversationIds.forEach((chatId) => {
        updatedActivity[chatId] = now
      })

      return updatedActivity
    })

    // Increase unread counts for destination conversations.
    setUnreadCounts((currentCounts) => {
      const updatedCounts = { ...currentCounts }

      conversationIds.forEach((chatId) => {
        updatedCounts[chatId] = (updatedCounts[chatId] ?? 0) + 1
      })

      return updatedCounts
    })

    // Close the forwarding dialog.
    setMessageToForward(null)
  }

  // Adds, changes, or removes the current user's reaction.
  function handleToggleReaction(message: ChatMessage, emoji: string) {
    if (!selectedChatId) return

    setMessagesByChat((currentMessages) => ({
      ...currentMessages,
      [selectedChatId]: (currentMessages[selectedChatId] ?? []).map(
        (currentMessage) => {
          if (currentMessage.id !== message.id) {
            return currentMessage
          }

          const reactions = currentMessage.reactions ?? []

          // Find the reaction this user has already selected.
          const myReaction = reactions.find((reaction) =>
            reaction.userIds.includes('me'),
          )

          // Clicking the same emoji removes the user's reaction.
          if (myReaction?.emoji === emoji) {
            return {
              ...currentMessage,
              reactions: reactions
                .map((reaction) => ({
                  ...reaction,
                  userIds: reaction.userIds.filter(
                    (userId) => userId !== 'me',
                  ),
                }))
                .filter((reaction) => reaction.userIds.length > 0),
            }
          }

          // Remove the user's previous reaction, if one exists.
          const updatedReactions = reactions
            .map((reaction) => ({
              ...reaction,
              userIds: reaction.userIds.filter(
                (userId) => userId !== 'me',
              ),
            }))
            .filter((reaction) => reaction.userIds.length > 0)

          // Add the user to the selected emoji, or create it.
          const existingReaction = updatedReactions.find(
            (reaction) => reaction.emoji === emoji,
          )

          if (existingReaction) {
            existingReaction.userIds.push('me')
          } else {
            updatedReactions.push({
              emoji,
              userIds: ['me'],
            })
          }

          return {
            ...currentMessage,
            reactions: updatedReactions,
          }
        },
      ),
    }))
  }

  // Pins or unpins a message in the current conversation.
  function handleTogglePin(message: ChatMessage) {
    if (!selectedChatId) return

    setMessagesByChat((currentMessages) => ({
      ...currentMessages,
      [selectedChatId]: (
        currentMessages[selectedChatId] ?? []
      ).map((currentMessage) =>
        currentMessage.id === message.id
          ? {
              ...currentMessage,
              pinned: !currentMessage.pinned,
            }
          : currentMessage,
      ),
    }))
  }

  // Stars or unstars a message in the current conversation.
  function handleToggleStar(message: ChatMessage) {
    if (!selectedChatId || message.deletedForEveryone) return

    setMessagesByChat((currentMessages) => ({
      ...currentMessages,
      [selectedChatId]: (
        currentMessages[selectedChatId] ?? []
      ).map((currentMessage) =>
        currentMessage.id === message.id
          ? {
              ...currentMessage,
              starred: !currentMessage.starred,
            }
          : currentMessage,
      ),
    }))

    // Close the message selection after starring or unstarring.
    setSelectedMessageId(null)
  }

  // Removes a star from a message on the Starred Messages page.
  function handleUnstarMessage(chatId: string, messageId: string) {
    setMessagesByChat((currentMessages) => ({
      ...currentMessages,
      [chatId]: (currentMessages[chatId] ?? []).map((message) =>
        message.id === messageId
          ? { ...message, starred: false }
          : message,
      ),
    }))
  }

  // Opens the original conversation and jumps to the starred message.
  function handleOpenStarredMessage(
    chatId: string,
    messageId: string,
  ) {
    setActivePage('chats')

    // Select the conversation and reset its previous search state.
    handleSelectChat(chatId)

    // Set the target after handleSelectChat clears the previous target.
    setSearchTargetMessageId(messageId)
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
            : message,
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
            : message,
        ),
      }))
    }, 5000)

    // Clear the reply selection after sending.
    setReplyingTo(null)
    setSelectedMessageId(null)
  }

                // Sends a recorded voice message.
          function handleSendVoiceMessage(audioBlob: Blob, duration: number) {
            if (!selectedChatId) return

            const chatId = selectedChatId
            const now = Date.now()
            const messageId = crypto.randomUUID()

            // Create a temporary URL for the recorded audio.
            const audioUrl = URL.createObjectURL(audioBlob)

            const newMessage: ChatMessage = {
              id: messageId,
              text: '',
              time: new Date(now).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              sender: 'me',
              status: 'sent',
              replyTo: replyingTo?.id,
              voiceMessage: {
                audioUrl,
                duration,
              },
            }

            // Add the voice message to the current conversation.
            setMessagesByChat((currentMessages) => ({
              ...currentMessages,
              [chatId]: [
                ...(currentMessages[chatId] ?? []),
                newMessage,
              ],
            }))

            // Update the conversation's latest activity.
            setLastActivityByChat((currentActivity) => ({
              ...currentActivity,
              [chatId]: now,
            }))

            // Simulate delivery after 1 second.
            setTimeout(() => {
              setMessagesByChat((currentMessages) => ({
                ...currentMessages,
                [chatId]: (currentMessages[chatId] ?? []).map((message) =>
                  message.id === messageId
                    ? { ...message, status: 'delivered' }
                    : message,
                ),
              }))
            }, 1000)

            // Simulate the recipient reading after 5 seconds.
            setTimeout(() => {
              setMessagesByChat((currentMessages) => ({
                ...currentMessages,
                [chatId]: (currentMessages[chatId] ?? []).map((message) =>
                  message.id === messageId
                    ? { ...message, status: 'read' }
                    : message,
                ),
              }))
            }, 5000)

            // Clear reply and message selection.
            setReplyingTo(null)
            setSelectedMessageId(null)
          }



      // Shares selected contacts in the current conversation.
          function handleShareContacts(contacts: Contact[]) {
            if (!selectedChatId) return

            const now = Date.now()

            const sharedMessage: ChatMessage = {
              id: crypto.randomUUID(),
              text: '',
              time: new Date(now).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              sender: 'me',
              status: 'sent',
              sharedContacts: contacts.map((contact) => ({
                id: contact.id,
                name: contact.name,
                phone: contact.phone,
                username: contact.username,
                avatar: contact.avatar,
              })),
            }

            setMessagesByChat((currentMessages) => ({
              ...currentMessages,
              [selectedChatId]: [
                ...(currentMessages[selectedChatId] ?? []),
                sharedMessage,
              ],
            }))

            setLastActivityByChat((currentActivity) => ({
              ...currentActivity,
              [selectedChatId]: now,
            }))

            setIsShareContactOpen(false)
            setSelectedMessageId(null)
            setReplyingTo(null)
          }



  // Temporary testing function: simulates a message from another user.
  function handleSimulateIncomingMessage() {
    const targetChatId =
      Object.keys(chatDetails).find(
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
      {/* Navigation rail is always visible */}
      <NavigationRail
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* Chats page */}
      {activePage === 'chats' && (
        <>
          <ConversationSidebar
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            messagesByChat={messagesByChat}
            lastActivityByChat={lastActivityByChat}
            unreadCounts={unreadCounts}
            onSimulateIncomingMessage={handleSimulateIncomingMessage}
            chatDetails={chatDetails}
          />

          <main className="flex-1 min-w-0 flex flex-col bg-app-bg">
            {selectedChat && selectedChatId ? (
              <>
                <ChatHeader
                  name={selectedChat.name}
                  initials={selectedChat.initials}
                  isOnline={selectedChat.isOnline}
                  isGroup={selectedChat.isGroup}
                  isTyping={isTypingPreview}
                  onSearchClick={() =>
                    setIsSearchOpen((current) => !current)
                  }
                />

                {/* Message search panel */}
                {isSearchOpen && (
                  <div className="border-b border-border bg-white px-4 py-3 sm:px-8">
                    <div className="mx-auto max-w-4xl">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(event) =>
                            setSearchQuery(event.target.value)
                          }
                          placeholder="Search messages in this conversation..."
                          autoFocus
                          className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setIsSearchOpen(false)
                            setSearchQuery('')
                            setSearchTargetMessageId(null)
                          }}
                          className="rounded-lg px-3 py-2 text-sm text-secondary transition hover:bg-surface hover:text-accent"
                        >
                          Close
                        </button>
                      </div>

                      {searchQuery.trim() && (
                        <div className="mt-3">
                          <p className="mb-2 text-xs text-secondary">
                            {searchResults.length === 1
                              ? '1 message found'
                              : `${searchResults.length} messages found`}
                          </p>

                          {searchResults.length > 0 ? (
                            <div className="max-h-48 overflow-y-auto">
                              {searchResults.map((message) => (
                                <button
                                  key={message.id}
                                  type="button"
                                  onClick={() => {
                                    setSearchTargetMessageId(message.id)
                                  }}
                                  className="mb-1 w-full rounded-lg px-3 py-2 text-left transition hover:bg-surface"
                                >
                                  <span className="mb-1 block text-[10px] text-secondary">
                                    {message.sender === 'me'
                                      ? 'You'
                                      : selectedChat.name}
                                    {' · '}
                                    {message.time}
                                  </span>

                                  <span className="block truncate text-sm text-primary">
                                    {message.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="py-3 text-center text-sm text-secondary">
                              No matching messages found.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <MessageList
                  messages={selectedMessages}
                  chatId={selectedChatId}
                  savedScrollTop={
                    scrollPositions.current[selectedChatId] ?? 0
                  }
                  onScrollPositionChange={(scrollTop) => {
                    scrollPositions.current[selectedChatId] = scrollTop
                  }}
                  selectedMessageId={selectedMessageId}
                  onSelectMessage={handleSelectMessage}
                  onReply={handleReplyMessage}
                  onForward={handleForwardMessage}
                  onEdit={handleEditMessage}
                  onDeleteForMe={handleDeleteForMe}
                  onDeleteForEveryone={handleDeleteForEveryone}
                  onToggleReaction={handleToggleReaction}
                  onTogglePin={handleTogglePin}
                  onToggleStar={handleToggleStar}
                  isTyping={isTypingPreview}
                  searchQuery={searchQuery}
                  searchTargetMessageId={searchTargetMessageId}
                  onSearchTargetHandled={() =>
                    setSearchTargetMessageId(null)
                  }
                />

                <MessageComposer
                  value={
                    editingMessage
                      ? editingText
                      : drafts[selectedChatId] ?? ''
                  }
                  onChange={handleComposerChange}
                  onSendMessage={handleSendMessage}
                  onSendVoiceMessage={handleSendVoiceMessage}
                  replyTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                  editingMessage={editingMessage}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onShareContact={() => setIsShareContactOpen(true)}
                  
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
        </>
      )}

      {/* Contacts page */}
      {activePage === 'contacts' && (
        <ContactsPage onMessageContact={handleMessageContact} />
      )}

      {/* Starred messages page */}
      {activePage === 'starred' && (
        <StarredMessagesPage
          messages={starredMessages}
          onOpenMessage={handleOpenStarredMessage}
          onUnstarMessage={handleUnstarMessage}
        />
      )}

      {/* Pages we haven't implemented yet */}
      {activePage !== 'chats' &&
        activePage !== 'contacts' &&
        activePage !== 'starred' && (
          <main className="flex-1 flex items-center justify-center">
            <p className="text-secondary">
              This page is coming soon.
            </p>
          </main>
        )}

      {/* Forward message dialog */}
      {messageToForward && (
        <ForwardMessageDialog
          message={messageToForward}
          conversations={Object.entries(chatDetails)
            .filter(([chatId]) => chatId !== selectedChatId)
            .map(([id, chat]) => ({
              id,
              name: chat.name,
              initials: chat.initials,
            }))}
          onClose={() => setMessageToForward(null)}
          onForward={handleConfirmForward}
        />
      )}
          {/* Share contact dialog */}
            {isShareContactOpen && (
              <ShareContactDialog
                contacts={sampleContacts}
                onClose={() => setIsShareContactOpen(false)}
                onShare={handleShareContacts}
              />
            )}
    </div>
  )
}

export default App
