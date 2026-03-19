'use client'

import { useTranslations } from 'next-intl'
import { CapsuleNav } from '@/components/ui/CapsuleNav'

interface WorkspaceWorkflowSidebarProps {
  items: Array<{
    id: string
    icon: string
    label: string
    status: 'empty' | 'active' | 'processing' | 'ready'
    disabled?: boolean
    disabledLabel?: string
  }>
  activeId: string
  onItemClick: (id: string) => void
  projectId: string
  episodeId?: string
  kickoffLabel: string
  onKickoff: () => void
}

export default function WorkspaceWorkflowSidebar({
  items,
  activeId,
  onItemClick,
  projectId,
  episodeId,
  kickoffLabel,
  onKickoff,
}: WorkspaceWorkflowSidebarProps) {
  const tWorkspace = useTranslations('workspace')

  return (
    <aside className="hidden xl:block xl:w-[18rem] xl:shrink-0">
      <div className="sticky top-[calc(env(safe-area-inset-top,0px)+4.25rem)] max-h-[calc(100vh-(env(safe-area-inset-top,0px)+5rem))] overflow-y-auto pr-1">
        <div className="glass-surface-soft rounded-[1.75rem] border border-[var(--glass-stroke-soft)] px-3 py-3 sm:px-4 sm:py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--glass-text-tertiary)]">
                  {tWorkspace('workflowRail.title')}
                </div>
              </div>
              <button
                type="button"
                onClick={onKickoff}
                className="glass-btn-base glass-btn-secondary shrink-0 px-3 py-1.5 text-xs font-semibold"
              >
                {kickoffLabel}
              </button>
            </div>

            <CapsuleNav
              items={items}
              activeId={activeId}
              onItemClick={onItemClick}
              projectId={projectId}
              episodeId={episodeId}
              orientation="vertical"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
