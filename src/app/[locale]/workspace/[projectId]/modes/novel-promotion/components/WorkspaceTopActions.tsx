'use client'

import { AppIcon } from '@/components/ui/icons'

interface WorkspaceTopActionsProps {
  onOpenAssetLibrary: () => void
  onOpenSettings: () => void
  onRefresh: () => void
  assetLibraryLabel: string
  settingsLabel: string
  refreshTitle: string
}

export default function WorkspaceTopActions({
  onOpenAssetLibrary,
  onOpenSettings,
  onRefresh,
  assetLibraryLabel,
  settingsLabel,
  refreshTitle,
}: WorkspaceTopActionsProps) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-start xl:justify-end sm:gap-3 lg:flex-nowrap">
      <button
        onClick={onOpenAssetLibrary}
        className="glass-btn-base glass-btn-secondary flex min-w-0 items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-3xl text-[var(--glass-text-primary)]"
      >
        <AppIcon name="package" className="h-5 w-5 shrink-0" />
        <span className="font-semibold text-sm tracking-[0.01em] truncate">{assetLibraryLabel}</span>
      </button>
      <button
        onClick={onOpenSettings}
        className="glass-btn-base glass-btn-secondary flex min-w-0 items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-3xl text-[var(--glass-text-primary)]"
      >
        <AppIcon name="settingsHexMinor" className="h-5 w-5 shrink-0" />
        <span className="font-semibold text-sm tracking-[0.01em] truncate">{settingsLabel}</span>
      </button>
      <button
        onClick={onRefresh}
        className="glass-btn-base glass-btn-secondary flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-3xl text-[var(--glass-text-primary)]"
        title={refreshTitle}
      >
        <AppIcon name="refresh" className="w-5 h-5" />
        <span className="font-semibold text-sm tracking-[0.01em] sm:hidden">{refreshTitle}</span>
      </button>
    </div>
  )
}
