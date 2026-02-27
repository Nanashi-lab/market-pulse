import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useConversationStore } from '@/store/conversationStore'
import type { Message } from '@/types'
import MessageBubble from './MessageBubble'
import ThinkingIndicator from './ThinkingIndicator'

const welcomeMessage: Message = {
  id: 'welcome',
  role: 'agent' as const,
  content: 'Welcome to **MarketPulse**. Ask me about stocks, market news, or your watchlist.',
  timestamp: new Date(),
}

export default function MessageArea() {
  const activeConv = useConversationStore((s) => s.activeConversation())
  const isThinking = useConversationStore((s) => s.isThinking)

  const messages =
    !activeConv || activeConv.messages.length === 0 ? [welcomeMessage] : activeConv.messages

  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isAtBottomRef.current = distanceFromBottom < 80
  }

  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isThinking])

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto py-4"
    >
      <div className="max-w-4xl mx-auto space-y-2 pb-2">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <MessageBubble message={msg} />
            </motion.div>
          ))}
          {isThinking && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <ThinkingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-2" />
      </div>
    </div>
  )
}
