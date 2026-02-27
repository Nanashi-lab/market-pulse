import { BookMarked, Menu } from 'lucide-react'
import { useConversationStore } from '@/store/conversationStore'

interface HeaderProps {
  onToggleWatchlist?: () => void
}

export default function Header({ onToggleWatchlist }: HeaderProps) {
  const setSidebarOpen = useConversationStore((s) => s.setSidebarOpen)
  const sidebarOpen = useConversationStore((s) => s.sidebarOpen)

  return (
    <header className="flex items-center shrink-0 h-14 px-6 bg-bg-surface border-b border-border-subtle/60 shadow-[0_1px_0_rgba(59,130,246,0.08)]">
      <div className="flex items-center gap-2.5 w-full">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1.5 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
        )}
        {/* Neon status dot with glow pulse */}
        <span className="w-2 h-2 rounded-full bg-accent-blue animate-glow-pulse shrink-0" />
        <span className="text-accent-blue font-semibold text-base tracking-wide select-none">
          MarketPulse
        </span>
        {/* Subtle separator */}
        <span className="ml-1 text-text-secondary text-xs font-normal tracking-normal">
          / AI Market Intelligence
        </span>
        {/* Watchlist toggle button — pushed to right */}
        <button
          onClick={onToggleWatchlist}
          className="ml-auto p-1.5 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Toggle watchlist"
        >
          <BookMarked size={18} />
        </button>
      </div>
    </header>
  )
}
