import type { ConverseStep } from '@/types'

interface WorkflowStatusBadgeProps {
  steps: ConverseStep[]
}

export default function WorkflowStatusBadge({ steps }: WorkflowStatusBadgeProps) {
  const hasWorkflow = steps.some(
    (step) =>
      step?.type === 'workflow' ||
      step?.type === 'workflow_execution' ||
      step?.type === 'workflow_result',
  )

  if (!hasWorkflow) return null

  return (
    <span className="inline-flex items-center gap-1 text-xs text-positive bg-positive/10 border border-positive/20 px-2 py-0.5 rounded-full mt-1">
      <span className="w-1.5 h-1.5 rounded-full bg-positive inline-block" />
      Workflow completed
    </span>
  )
}
