import { useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { useConversationStore } from '@/store/conversationStore'
import type { Conversation } from '@/types'

interface SidebarItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

export default function SidebarItem({ conversation, isActive, onClick }: SidebarItemProps) {
  const renameConversation = useConversationStore((s) => s.renameConversation)
  const deleteConversation = useConversationStore((s) => s.deleteConversation)

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(conversation.title)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleTitleDoubleClick() {
    setEditValue(conversation.title)
    setIsEditing(true)
  }

  function commitRename() {
    renameConversation(conversation.id, editValue.trim() || conversation.title)
    setIsEditing(false)
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitRename()
    } else if (e.key === 'Escape') {
      setEditValue(conversation.title)
      setIsEditing(false)
    }
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirmDelete) {
      deleteConversation(conversation.id)
    } else {
      setConfirmDelete(true)
    }
  }

  function handleMouseLeave() {
    setConfirmDelete(false)
  }

  return (
    <div
      className={[
        'group relative flex items-center px-3 py-2.5 cursor-pointer select-none',
        isActive
          ? 'bg-accent-blue/15 border-l-2 border-accent-blue'
          : 'border-l-2 border-transparent hover:bg-bg-elevated',
      ].join(' ')}
      onClick={!isEditing ? onClick : undefined}
      onMouseLeave={handleMouseLeave}
    >
      {/* Title / Rename input */}
      <div className="flex-1 min-w-0 mr-1">
        {isEditing ? (
          <input
            autoFocus
            className="w-full bg-transparent text-sm text-text-primary outline-none"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleInputKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="block truncate text-sm text-text-primary">
            {conversation.title}
          </span>
        )}
      </div>

      {/* Action buttons — visible on hover */}
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {/* Pencil — click to rename */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleTitleDoubleClick()
            }}
            className="p-1 text-text-muted hover:text-accent-blue transition-colors rounded"
            title="Rename conversation"
          >
            <Pencil size={13} />
          </button>

          {/* Delete button — two-click confirm */}
          {confirmDelete ? (
            <button
              onClick={handleDeleteClick}
              className="px-1.5 py-0.5 rounded text-xs text-red-400 bg-red-500/15 hover:bg-red-500/25 transition-colors"
              title="Confirm delete"
            >
              Delete?
            </button>
          ) : (
            <button
              onClick={handleDeleteClick}
              className="p-1 text-text-muted hover:text-red-400 transition-colors rounded"
              title="Delete conversation"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
