
export type MessageStatus = 'sent' | 'delivered' | 'read'

// Represents one emoji reaction and the users who selected it.
export type MessageReaction = {
  emoji: string
  userIds: string[]
}

export type ChatMessage = {
  id: string
  text: string
  time: string
  sender: 'me' | 'other'
  status?: MessageStatus

  // ID of the message this message replies to.
  replyTo?: string

  // Indicates whether the message has been edited.
  edited?: boolean

  // Indicates whether the message has been deleted for everyone.
  deletedForEveryone?: boolean

  // Reactions added to this message.
  reactions?: MessageReaction[]

  // Indicates whether the message is pinned.
  pinned?: boolean

  // Indicates whether the message is forwarded from another chat.
  forwarded?: boolean

    // Indicates whether the message has been starred by the current user.
  starred?: boolean
}
