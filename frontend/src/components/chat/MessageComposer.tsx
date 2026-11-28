
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

import {
  Paperclip,
  Smile,
  Send,
  Save,
  X,
  ContactRound,
  Mic,
  Square,
  Trash2,
} from 'lucide-react'

import type { ChatMessage } from './types'

type MessageComposerProps = {
  value: string
  onChange: (value: string) => void
  onSendMessage: (text: string) => void

  replyTo: ChatMessage | null
  onCancelReply: () => void

  editingMessage: ChatMessage | null
  onSaveEdit: (messageId: string, text: string) => void
  onCancelEdit: () => void

  onShareContact: () => void

  onSendVoiceMessage: (audioBlob: Blob, duration: number) => void
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function MessageComposer({
  value,
  onChange,
  onSendMessage,
  replyTo,
  onCancelReply,
  editingMessage,
  onSaveEdit,
  onCancelEdit,
  onShareContact,
  onSendVoiceMessage,
}: MessageComposerProps) {
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] =
    useState(false)

  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [recordingError, setRecordingError] = useState('')

  const attachmentMenuRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingStartRef = useRef<number>(0)
  const recordingDurationRef = useRef<number>(0)
  const previewUrlRef = useRef<string | null>(null)

  // Close attachment menu when clicking outside or pressing Escape.
  useEffect(() => {
    if (!isAttachmentMenuOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target as Node)
      ) {
        setIsAttachmentMenuOpen(false)
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAttachmentMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAttachmentMenuOpen])

  // Update recording duration while recording.
  useEffect(() => {
    if (!isRecording) return

    const interval = window.setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - recordingStartRef.current) / 1000,
      )

      setRecordingDuration(elapsed)
    }, 250)

    return () => window.clearInterval(interval)
  }, [isRecording])

  // Release microphone resources and temporary audio URLs on unmount.
  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current

      if (recorder && recorder.state !== 'inactive') {
        recorder.ondataavailable = null
        recorder.onstop = null
        recorder.stop()
      }

      mediaStreamRef.current?.getTracks().forEach((track) => {
        track.stop()
      })

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  function handleSend() {
    const trimmedMessage = value.trim()

    if (!trimmedMessage) return

    if (editingMessage) {
      onSaveEdit(editingMessage.id, trimmedMessage)
    } else {
      onSendMessage(trimmedMessage)
    }

    onChange('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    handleSend()
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  function handleShareContact() {
    setIsAttachmentMenuOpen(false)
    onShareContact()
  }

  async function handleStartRecording() {
    setRecordingError('')

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecordingError(
        'Audio recording is not supported by this browser.',
      )
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      mediaStreamRef.current = stream
      audioChunksRef.current = []

      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ]

      const supportedMimeType = mimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type),
      )

      const recorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })

        mediaStreamRef.current?.getTracks().forEach((track) => {
          track.stop()
        })

        mediaStreamRef.current = null

        if (blob.size === 0) {
          setRecordingError('No audio was recorded. Please try again.')
          return
        }

        const url = URL.createObjectURL(blob)

        previewUrlRef.current = url
        setAudioBlob(blob)
        setAudioPreview(url)
        setAudioDuration(recordingDurationRef.current)
      }

      recordingStartRef.current = Date.now()
      recordingDurationRef.current = 0

      setRecordingDuration(0)
      recorder.start()
      setIsRecording(true)
    } catch {
      mediaStreamRef.current?.getTracks().forEach((track) => {
        track.stop()
      })

      mediaStreamRef.current = null

      setRecordingError(
        'Microphone access was denied or unavailable. Check your browser permissions.',
      )
    }
  }

  function handleStopRecording() {
    const recorder = mediaRecorderRef.current

    if (!recorder || recorder.state === 'inactive') return

    const duration = Math.max(
      1,
      Math.round((Date.now() - recordingStartRef.current) / 1000),
    )

    recordingDurationRef.current = duration
    setRecordingDuration(duration)
    setIsRecording(false)

    recorder.stop()
  }

  function handleCancelRecording() {
    if (isRecording) {
      const recorder = mediaRecorderRef.current

      if (recorder && recorder.state !== 'inactive') {
        recorder.ondataavailable = null
        recorder.onstop = null
        recorder.stop()
      }

      mediaStreamRef.current?.getTracks().forEach((track) => {
        track.stop()
      })

      mediaStreamRef.current = null
      mediaRecorderRef.current = null
      audioChunksRef.current = []

      setIsRecording(false)
      setRecordingDuration(0)
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    setAudioPreview(null)
    setAudioBlob(null)
    setAudioDuration(0)
    setRecordingError('')
  }

  function handleSendVoiceMessage() {
    if (!audioBlob) return

    onSendVoiceMessage(audioBlob, audioDuration)
    handleCancelRecording()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-border bg-white px-4 py-4 sm:px-8"
    >
      <div className="mx-auto max-w-4xl">

        {/* Edit mode information */}
        {editingMessage && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border-l-4 border-accent bg-accent-soft p-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent">
                Editing message
              </p>

              <p className="mt-1 truncate text-sm text-secondary">
                {editingMessage.text}
              </p>
            </div>

            <button
              type="button"
              onClick={onCancelEdit}
              title="Cancel editing"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-secondary transition hover:bg-white hover:text-danger"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Reply information */}
        {replyTo && !editingMessage && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border-l-4 border-accent bg-accent-soft p-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent">
                Replying to {replyTo.sender === 'me' ? 'yourself' : 'message'}
              </p>

              <p className="mt-1 truncate text-sm text-secondary">
                {replyTo.text ||
                  (replyTo.sharedContacts?.length
                    ? 'Contact shared'
                    : replyTo.voiceMessage
                      ? 'Voice message'
                      : 'Message')}
              </p>
            </div>

            <button
              type="button"
              onClick={onCancelReply}
              title="Cancel reply"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-secondary transition hover:bg-white hover:text-danger"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Recording error */}
        {recordingError && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            <span>{recordingError}</span>

            <button
              type="button"
              onClick={() => setRecordingError('')}
              aria-label="Dismiss recording error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2">

          {/* Recording interface */}
          {isRecording ? (
            <div className="flex min-h-11 flex-1 items-center gap-3 px-3">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />

              <span className="text-sm font-medium text-primary">
                Recording...
              </span>

              <span className="ml-auto text-sm tabular-nums text-secondary">
                {formatDuration(recordingDuration)}
              </span>

              <button
                type="button"
                onClick={handleStopRecording}
                title="Stop recording"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-600"
              >
                <Square size={17} fill="currentColor" />
              </button>

              <button
                type="button"
                onClick={handleCancelRecording}
                title="Cancel recording"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-secondary transition hover:bg-surface-hover hover:text-danger"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ) : audioPreview ? (
            <div className="flex min-w-0 flex-1 flex-col gap-3 p-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">
                  Voice message preview
                </span>

                <span className="text-xs text-secondary">
                  {formatDuration(audioDuration)}
                </span>
              </div>

              <audio
                src={audioPreview}
                controls
                className="h-9 w-full"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelRecording}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-secondary transition hover:bg-surface-hover hover:text-danger"
                >
                  <Trash2 size={15} />
                  Delete
                </button>

                <button
                  type="button"
                  onClick={handleSendVoiceMessage}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-hover"
                >
                  <Send size={15} />
                  Send voice message
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Attachment menu */}
              <div className="relative shrink-0" ref={attachmentMenuRef}>
                <button
                  type="button"
                  title="Attachments"
                  aria-label="Open attachment menu"
                  aria-haspopup="menu"
                  aria-expanded={isAttachmentMenuOpen}
                  onClick={() =>
                    setIsAttachmentMenuOpen((isOpen) => !isOpen)
                  }
                  disabled={!!editingMessage}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-secondary transition hover:bg-surface-hover hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Paperclip size={20} />
                </button>

                {isAttachmentMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Attachment options"
                    className="absolute bottom-full left-0 z-50 mb-3 w-52 rounded-xl border border-border bg-white p-2 shadow-xl"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleShareContact}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-primary transition hover:bg-surface"
                    >
                      <ContactRound size={19} className="text-accent" />
                      <span className="font-medium">Share contact</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Message input */}
              <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  editingMessage
                    ? 'Edit your message...'
                    : 'Write a message...'
                }
                rows={1}
                className="max-h-32 min-w-0 flex-1 resize-none bg-transparent py-3 text-sm text-primary outline-none placeholder:text-secondary"
              />

              <button
                type="button"
                title="Emoji"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-secondary transition hover:bg-surface-hover hover:text-accent"
              >
                <Smile size={20} />
              </button>

              {value.trim() ? (
                <button
                  type="submit"
                  title={editingMessage ? 'Save changes' : 'Send message'}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent-hover"
                >
                  {editingMessage ? (
                    <Save size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  title="Record voice message"
                  disabled={!!editingMessage}
                  onClick={handleStartRecording}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Mic size={19} />
                </button>
              )}
            </>
          )}
        </div>

        <p className="mt-2 text-center text-[10px] text-secondary">
          {isRecording
            ? 'Recording audio · Select Stop when finished'
            : audioPreview
              ? 'Listen to your recording before sending'
              : editingMessage
                ? 'Press Enter to save changes · Shift + Enter for a new line'
                : 'Press Enter to send · Shift + Enter for a new line · Microphone to record'}
        </p>
      </div>
    </form>
  )
}

export default MessageComposer
