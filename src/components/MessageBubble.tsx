import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { useConversationStore } from '@/store/conversationStore'
import type { Message } from '@/types'
import ToolTraceAccordion from '@/components/ToolTraceAccordion'
import WorkflowStatusBadge from '@/components/WorkflowStatusBadge'

interface MessageBubbleProps {
  message: Message
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    void navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="text-text-muted hover:text-text-secondary text-xs px-1.5 py-0.5 rounded bg-bg-elevated hover:bg-bg-elevated/80 transition-colors duration-150 cursor-pointer"
      title="Copy message"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

const markdownComponents = {
  td: ({ children, ...props }: React.ComponentProps<'td'>) => {
    const text = String(children ?? '').trim()
    // Match patterns like +1.23, -4.56%, +12.5%, -0.8
    const isPositive = /^\+\d+(\.\d+)?%?$/.test(text)
    const isNegative = /^-\d+(\.\d+)?%?$/.test(text)
    return (
      <td
        {...props}
        className={
          isPositive ? 'text-positive font-medium' :
          isNegative ? 'text-negative font-medium' :
          ''
        }
      >
        {children}
      </td>
    )
  },
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const retry = useConversationStore((s) => s.retry)

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-1 group">
        <div className="relative max-w-[85%] lg:max-w-[70%]">
          <div className="bg-bg-user-msg text-text-primary rounded-xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed break-words hover:border-accent-blue/20 border border-transparent transition-colors duration-150">
            {message.content}
          </div>
          {/* Hover reveal: timestamp + copy */}
          <div className="absolute -bottom-6 right-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto whitespace-nowrap">
            <span className="text-text-muted text-xs">{formatTime(message.timestamp)}</span>
            <CopyButton content={message.content} />
          </div>
        </div>
      </div>
    )
  }

  // Agent message
  return (
    <div className="flex justify-start px-4 py-1 group">
      <div className="relative w-full max-w-3xl">
        <div
          className={[
            'bg-bg-surface rounded-xl rounded-tl-sm px-4 py-3 transition-colors duration-150',
            message.error
              ? 'border border-negative/30 shadow-[0_0_12px_rgba(255,77,109,0.08)]'
              : 'border border-transparent hover:border-border-subtle/50',
          ].join(' ')}
        >
          {message.error ? (
            <div className="text-negative text-sm leading-relaxed">
              <p>{message.content}</p>
              <button
                onClick={() => retry()}
                className="mt-2.5 text-xs px-3 py-1.5 rounded bg-negative/10 hover:bg-negative/20 text-negative border border-negative/30 transition-colors duration-150 cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="agent-markdown text-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.steps && message.steps.length > 0 && (
                <ToolTraceAccordion steps={message.steps} />
              )}
              {message.steps && message.steps.length > 0 && (
                <WorkflowStatusBadge steps={message.steps} />
              )}
            </>
          )}
        </div>
        {/* Hover reveal: timestamp + copy */}
        <div className="absolute -bottom-6 left-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto whitespace-nowrap">
          <span className="text-text-muted text-xs">{formatTime(message.timestamp)}</span>
          <CopyButton content={message.content} />
        </div>
      </div>
    </div>
  )
}
