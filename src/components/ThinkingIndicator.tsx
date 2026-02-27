export default function ThinkingIndicator() {
  return (
    <div className="flex items-start px-4 py-2">
      <div className="bg-bg-surface rounded-xl px-4 py-3 flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full bg-accent-blue animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-accent-blue animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-accent-blue animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  )
}
