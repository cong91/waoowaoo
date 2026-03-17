'use client'

import ImagePreviewModal from '@/components/ui/ImagePreviewModal'
import PromptListPanel from './PromptListPanel'
import PromptEditorPanel from './PromptEditorPanel'
import { usePromptStageActions, type PromptsStageShellProps } from './hooks/usePromptStageActions'
import { useWorkspaceStageRuntime } from '../../WorkspaceStageRuntimeContext'
import { useTranslations } from 'next-intl'

export type { PromptsStageShellProps }

export default function PromptsStageLayout(props: PromptsStageShellProps) {
  const runtime = usePromptStageActions(props)
  const stageRuntime = useWorkspaceStageRuntime()
  const tw = useTranslations('workspace')

  return (
    <div className="space-y-6">
      <div className={`rounded-lg border px-4 py-3 ${stageRuntime.promptMode === 'advanced'
        ? 'border-[var(--glass-tone-warning-fg)]/30 bg-[var(--glass-tone-warning-bg)]/10'
        : 'border-[var(--glass-border)]/40 bg-[var(--glass-background-secondary)]/30'
        }`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.12em] text-[var(--glass-text-tertiary)]">{tw('visualFirst.promptMode.title')}</div>
            <div className="text-sm font-semibold text-[var(--glass-text-primary)] mt-1">
              {stageRuntime.promptMode === 'advanced'
                ? tw('visualFirst.promptMode.advanced.title')
                : tw('visualFirst.promptMode.guided.title')}
            </div>
            <div className="text-xs text-[var(--glass-text-secondary)] mt-1">
              {stageRuntime.promptMode === 'advanced'
                ? tw('visualFirst.promptMode.advanced.desc')
                : tw('visualFirst.promptMode.guided.desc')}
            </div>
          </div>
          <div className="text-xs text-[var(--glass-text-tertiary)]">
            {tw('visualFirst.referenceBoard.selectionCount', { count: stageRuntime.referenceBoardSelections.length })}
          </div>
        </div>
      </div>
      {runtime.previewImage && (
        <ImagePreviewModal
          imageUrl={runtime.previewImage}
          onClose={() => runtime.setPreviewImage(null)}
        />
      )}

      <PromptListPanel runtime={runtime} />
      <PromptEditorPanel runtime={runtime} />
    </div>
  )
}
