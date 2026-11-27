
import { useState } from 'react'
import { Check, Search, X } from 'lucide-react'

import type { Contact } from '../contacts/types'

type ShareContactDialogProps = {
  contacts: Contact[]
  onClose: () => void
  onShare: (contacts: Contact[]) => void
}

function ShareContactDialog({
  contacts,
  onClose,
  onShare,
}: ShareContactDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filteredContacts = contacts.filter((contact) =>
    `${contact.name} ${contact.username} ${contact.phone}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  )

  function handleToggleContact(contactId: string) {
    setSelectedIds((currentIds) =>
      currentIds.includes(contactId)
        ? currentIds.filter((id) => id !== contactId)
        : [...currentIds, contactId],
    )
  }

  function handleShare() {
    const selectedContacts = contacts.filter((contact) =>
      selectedIds.includes(contact.id),
    )

    if (selectedContacts.length === 0) return

    onShare(selectedContacts)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-primary">
              Share contacts
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Select contacts to share in this conversation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="rounded-lg p-2 text-secondary transition hover:bg-surface-hover"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3">
            <Search size={18} className="text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search contacts..."
              className="w-full bg-transparent py-3 text-sm text-primary outline-none"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto px-4 pb-3">
          {filteredContacts.length === 0 ? (
            <p className="py-8 text-center text-sm text-secondary">
              No contacts found.
            </p>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = selectedIds.includes(contact.id)

              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => handleToggleContact(contact.id)}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-surface"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-soft-accent font-semibold text-accent">
                    {contact.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-primary">
                      {contact.name}
                    </p>
                    <p className="truncate text-xs text-secondary">
                      {contact.phone}
                    </p>
                  </div>

                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                      isSelected
                        ? 'border-accent bg-accent text-white'
                        : 'border-border text-transparent'
                    }`}
                  >
                    {isSelected && <Check size={14} />}
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border p-4">
          <p className="text-sm text-secondary">
            {selectedIds.length} selected
          </p>

          <button
            type="button"
            onClick={handleShare}
            disabled={selectedIds.length === 0}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareContactDialog
