export type MessageStatus = 'sent' | 'delivered' | 'read'

export type ChatMessage = {
  id: string
  text: string
  time: string
  sender: 'me' | 'other'
  status?: MessageStatus

  // ID of the message this message replies to.
  replyTo?: string
}