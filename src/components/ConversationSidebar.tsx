import { Search, Plus, PanelLeftClose, X } from 'lucide-react'
import { useConversationStore } from '@/store/conversationStore'
import SidebarItem from '@/components/SidebarItem'

export default function ConversationSidebar() {
  const conversations = useConversationStore((s) => s.conversations)
  const activeConversationId = useConversationStore((s) => s.activeConversationId)
  const sidebarOpen = useConversationStore((s) => s.sidebarOpen)
  const searchQuery = useConversationStore((s) => s.searchQuery)
  const newConversation = useConversationStore((s) => s.newConversation)
  const switchConversation = useConversationStore((s) => s.switchConversation)
  const setSidebarOpen = useConversationStore((s) => s.setSidebarOpen)
  const setSearchQuery = useConversationStore((s) => s.setSearchQuery)

  // Derive sorted + filtered list (not in store)
  const filtered = conversations
    .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  function handleSelectConversation(id: string) {
    switchConversation(id)
    // Auto-close on mobile (below md breakpoint)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  return (
    <>
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          // Mobile: fixed overlay; Desktop: part of flex row
          'fixed inset-y-0 left-0 z-40 flex flex-col',
          'md:static md:z-auto',
          'bg-bg-surface border-r border-border-subtle',
          'transition-[width] duration-200 ease-in-out overflow-hidden',
          sidebarOpen ? 'w-64' : 'w-0',
        ].join(' ')}
      >
        {/* Inner container — prevents content wrapping during width transition */}
        <div className="w-64 flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-3 py-3 shrink-0 border-b border-border-subtle/60">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Conversations
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-text-secondary hover:text-text-primary transition-colors rounded"
              aria-label="Close sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          {/* New Chat button */}
          <div className="px-2 pt-3 pb-2 shrink-0">
            <button
              onClick={newConversation}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-accent-blue hover:bg-bg-elevated rounded-md transition-colors"
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>

          {/* Search input */}
          <div className="px-2 pb-2 shrink-0">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchQuery('')
                }}
                className="w-full pl-8 pr-7 py-2 bg-bg-primary/50 border border-border-subtle rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && !searchQuery && (
              <p className="px-3 py-4 text-xs text-text-muted text-center">
                No conversations yet
              </p>
            )}
            {filtered.length === 0 && searchQuery && (
              <p className="px-3 py-4 text-xs text-text-muted text-center">
                No results for &ldquo;{searchQuery}&rdquo;
              </p>
            )}
            {filtered.map((conversation) => (
              <SidebarItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => handleSelectConversation(conversation.id)}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
