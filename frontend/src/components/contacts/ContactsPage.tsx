
import { useState } from 'react'
import {
  Search,
  UserPlus,
  Users,
  X,
  MessageCircle,
} from 'lucide-react'

import { sampleContacts } from './sampleContacts'
import type { Contact } from './types'

type ContactsPageProps = {
  onMessageContact: (contact: Contact) => void
}

function ContactsPage({ onMessageContact }: ContactsPageProps) {
  const [contacts, setContacts] = useState<Contact[]>(sampleContacts)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase()

    return (
      contact.name.toLowerCase().includes(query) ||
      contact.username.toLowerCase().includes(query) ||
      contact.phone.includes(query)
    )
  })

  function handleAddContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedUsername = username.trim().toLowerCase()
    const trimmedPhone = phone.trim()

    if (!trimmedName || !trimmedUsername || !trimmedPhone) {
      setError('Please fill in all fields.')
      return
    }

    const normalizedUsername = trimmedUsername.startsWith('@')
      ? trimmedUsername
      : `@${trimmedUsername}`

    const normalizedPhone = trimmedPhone.replace(/\s+/g, '')

    if (!/^\+?[0-9]{7,15}$/.test(normalizedPhone)) {
      setError('Please enter a valid phone number.')
      return
    }

    const alreadyExists = contacts.some(
      (contact) =>
        contact.username.toLowerCase() === normalizedUsername,
    )

    if (alreadyExists) {
      setError('This username is already in your contacts.')
      return
    }

    const phoneAlreadyExists = contacts.some(
      (contact) =>
        contact.phone.replace(/\s+/g, '') === normalizedPhone,
    )

    if (phoneAlreadyExists) {
      setError('This phone number is already in your contacts.')
      return
    }

    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: trimmedName,
      phone: normalizedPhone,
      username: normalizedUsername,
      initials: trimmedName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      isOnline: false,
    }

    setContacts((currentContacts) => [
      ...currentContacts,
      newContact,
    ])

    setName('')
    setUsername('')
    setPhone('')
    setError('')
    setIsAddFormOpen(false)
  }

  return (
    <section className="flex-1 min-w-0 bg-app-bg flex flex-col">
      <header className="h-20 px-6 border-b border-border bg-sidebar flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Contacts</h1>
          <p className="text-sm text-secondary">
            Connect with your people
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddFormOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-white hover:bg-accent-hover transition"
        >
          <UserPlus size={18} />
          <span>Add contact</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative mb-6">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, username or phone..."
              className="w-full rounded-xl border border-border bg-sidebar py-3 pl-11 pr-4 outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">My contacts</h2>
            <span className="text-sm text-secondary">
              {filteredContacts.length} contacts
            </span>
          </div>

          {filteredContacts.length > 0 ? (
            <div className="flex flex-col gap-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-sidebar p-4 hover:bg-surface transition"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center font-semibold">
                      {contact.initials}
                    </div>

                    {contact.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-sidebar" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {contact.name}
                    </h3>
                    <p className="text-sm text-secondary">
                      {contact.username}
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      {contact.phone}
                    </p>
                  </div>

                  <span className="text-xs text-secondary">
                    {contact.isOnline ? 'Online' : 'Offline'}
                  </span>

                  <button
                    type="button"
                    onClick={() => onMessageContact(contact)}
                    className="flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-white transition"
                  >
                    <MessageCircle size={16} />
                    <span>Message</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-sidebar p-10 text-center">
              <Users
                size={36}
                className="mx-auto mb-3 text-secondary"
              />
              <h3 className="font-semibold mb-1">
                No contacts found
              </h3>
              <p className="text-sm text-secondary">
                Try searching with another name, username or phone.
              </p>
            </div>
          )}
        </div>
      </div>

      {isAddFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-sidebar p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Add new contact</h2>

              <button
                type="button"
                onClick={() => {
                  setIsAddFormOpen(false)
                  setError('')
                }}
                className="rounded-lg p-2 text-secondary hover:bg-surface"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full name
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-border bg-app-bg px-4 py-3 outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter username"
                  className="w-full rounded-xl border border-border bg-app-bg px-4 py-3 outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+251 911 000 005"
                  className="w-full rounded-xl border border-border bg-app-bg px-4 py-3 outline-none focus:border-accent"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-accent py-3 font-medium text-white hover:bg-accent-hover transition"
              >
                Add contact
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default ContactsPage
