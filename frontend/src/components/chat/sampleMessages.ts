
import type { ChatMessage } from './types'

export const sampleMessages: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: 'm1',
      text: 'Hey! How is the project going?',
      time: '10:42',
      sender: 'other',
      reactions: [
        { emoji: '👍', userIds: ['me', 'user-2'] },
        { emoji: '❤️', userIds: ['user-3'] },
      ],
    },
    {
      id: 'm2',
      text: 'It is going really well! I just finished the conversation sidebar.',
      time: '10:43',
      sender: 'me',
      status: 'read',
      reactions: [
        { emoji: '🔥', userIds: ['me', 'user-2', 'user-3'] },
      ],
    },
    {
      id: 'm3',
      text: 'That is great. What are you working on next?',
      time: '10:44',
      sender: 'other',
    },
    {
      id: 'm4',
      text: 'The main chat interface. We are building it step by step.',
      time: '10:45',
      sender: 'me',
      status: 'delivered',
      reactions: [
        { emoji: '😂', userIds: ['user-2'] },
        { emoji: '💯', userIds: ['me', 'user-3'] },
      ],
    },
  ],

  '2': [
    {
      id: 'm5',
      text: 'Welcome everyone to the software engineering group!',
      time: '09:20',
      sender: 'other',
      reactions: [
        { emoji: '🎉', userIds: ['me', 'user-2', 'user-3'] },
        { emoji: '❤️', userIds: ['user-4'] },
      ],
    },
    {
      id: 'm6',
      text: 'I pushed the latest changes.',
      time: '09:35',
      sender: 'other',
      reactions: [
        { emoji: '👍', userIds: ['me'] },
      ],
    },
  ],

  '3': [
    {
      id: 'm7',
      text: 'Did you finish the assignment?',
      time: 'Yesterday',
      sender: 'other',
    },
    {
      id: 'm8',
      text: 'Yes, I completed it last night.',
      time: 'Yesterday',
      sender: 'me',
      status: 'read',
      reactions: [
        { emoji: '👏', userIds: ['me', 'user-2'] },
      ],
    },
    {
      id: 'm9',
      text: 'Thanks, see you tomorrow!',
      time: 'Yesterday',
      sender: 'other',
    },
  ],

  '4': [
    {
      id: 'm10',
      text: 'Let us discuss the project design.',
      time: 'Yesterday',
      sender: 'other',
    },
    {
      id: 'm11',
      text: 'Let us finish the design first.',
      time: 'Yesterday',
      sender: 'me',
      status: 'read',
    },
  ],

  '5': [
    {
      id: 'm12',
      text: 'Can you send me the document?',
      time: 'Monday',
      sender: 'other',
    },
  ],
}
