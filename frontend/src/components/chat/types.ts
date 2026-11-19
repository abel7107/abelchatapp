export type MessageStatus = 'sent' | 'delivered' | 'read'

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

}