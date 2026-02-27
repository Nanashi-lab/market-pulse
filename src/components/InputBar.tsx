import { useRef, useState, useCallback } from 'react'
import { Send } from 'lucide-react'
import { useConversationStore } from '@/store/conversationStore'

const LINE_HEIGHT = 24 // px, matches text-sm leading-relaxed roughly
const MAX_LINES = 5

export default function InputBar() {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const send = useConversationStore((s) => s.send)
  const isThinking = useConversationStore((s) => s.isThinking)
  const activeConv = useConversationStore((s) => s.activeConversation())

  // Show placeholder only on new/empty conversations
  const placeholder =
    !activeConv || activeConv.messages.length === 0
      ? 'Ask about stocks, news, or your watchlist...'
      : ''

  const canSend = text.trim().length > 0 && !isThinking

  const autoGrow = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, LINE_HEIGHT * MAX_LINES) + 'px'
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    autoGrow()
  }

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return
    void send(trimmed)
    setText('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.focus()
    }
  }, [text, isThinking, send])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="shrink-0 bg-bg-surface border-t border-border-subtle px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className={[
            'flex-1 resize-none rounded-xl px-4 py-2.5',
            'bg-bg-primary text-text-primary text-sm leading-relaxed',
            'border border-border-subtle',
            'focus:border-accent-blue/50 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.2)]',
            'outline-none placeholder:text-text-muted',
            'transition-all duration-150',
            'overflow-y-auto',
          ].join(' ')}
          style={{ maxHeight: LINE_HEIGHT * MAX_LINES + 'px' }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={[
            'shrink-0 flex items-center justify-center',
            'w-10 h-10 rounded-xl',
            'transition-all duration-150',
            canSend
              ? 'bg-accent-blue text-bg-primary hover:brightness-110 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.25)]'
              : 'bg-bg-elevated text-text-muted cursor-not-allowed opacity-40',
          ].join(' ')}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-center text-text-muted text-xs mt-2 max-w-4xl mx-auto opacity-50">
        Press Enter to send &middot; Shift+Enter for new line
      </p>
    </div>
  )
}
