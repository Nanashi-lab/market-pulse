import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { ConverseStep } from '@/types'

interface ToolTraceAccordionProps {
  steps: ConverseStep[]
}

export default function ToolTraceAccordion({ steps }: ToolTraceAccordionProps) {
  const [open, setOpen] = useState(false)

  const toolSteps = steps.filter(
    (step) =>
      step?.tool_id != null ||
      step?.type === 'tool_call' ||
      step?.type === 'tool' ||
      step?.type === 'tool_use',
  )

  if (toolSteps.length === 0) return null

  const count = toolSteps.length
  const label = `Ran ${count} tool${count === 1 ? '' : 's'}`

  return (
    <div className="mt-2 border border-border-subtle/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-elevated/40 transition-colors duration-150 cursor-pointer"
        aria-expanded={open}
      >
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={12} />
        </motion.span>
        {label}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="tool-trace-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <ul className="px-3 pb-2 pt-1 flex flex-col gap-0.5">
              {toolSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="font-mono text-xs text-text-muted"
                >
                  {step.tool_id ?? step.type ?? 'unknown'}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
