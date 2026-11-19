
type TypingIndicatorProps = {
  isVisible: boolean
}

function TypingIndicator({ isVisible }: TypingIndicatorProps) {
  if (!isVisible) return null

  return (
    <div className="flex items-end gap-2 px-5 py-3">
      <div className="rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3 shadow-sm">
        <div
          className="flex items-center gap-1"
          aria-label="Someone is typing"
          role="status"
        >
          <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
