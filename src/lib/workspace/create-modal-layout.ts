export const CREATE_WORKSPACE_MODAL_OVERLAY_CLASS = 'fixed inset-0 glass-overlay z-50 flex items-center justify-center backdrop-blur-sm p-2 sm:p-4 lg:p-6'

export const CREATE_WORKSPACE_MODAL_SURFACE_CLASS = 'glass-surface-modal w-full max-w-[min(960px,calc(100vw-1rem))] sm:max-w-[min(960px,calc(100vw-2rem))] max-h-[min(92vh,860px)] overflow-hidden rounded-[28px] border border-[var(--glass-border)]/60 bg-[var(--glass-background)]/96 shadow-[0_24px_80px_rgba(15,23,42,0.24)]'

export const CREATE_WORKSPACE_MODAL_BODY_CLASS = 'overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-6'

export const CREATE_WORKSPACE_MODAL_FOOTER_CLASS = 'sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[var(--glass-border)]/50 bg-[color-mix(in_srgb,var(--glass-background)_88%,white_12%)]/95 px-4 py-3 backdrop-blur md:flex-row md:items-center md:justify-between sm:px-6 lg:px-7'

export const CREATE_WORKSPACE_OPTION_GRID_CLASS = 'grid grid-cols-1 gap-3'

export const CREATE_WORKSPACE_STEP_GRID_CLASS = 'grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5'

export function getCreateWorkspaceOptionCardClass(active: boolean): string {
  return [
    'glass-btn-base group relative flex min-h-[112px] min-w-0 items-start rounded-2xl border px-4 py-4 text-left transition-all duration-200',
    active
      ? 'glass-btn-primary border-[var(--glass-primary)]/45 ring-2 ring-[var(--glass-primary)]/30 shadow-[0_14px_34px_rgba(76,166,255,0.18)]'
      : 'glass-btn-secondary border-[var(--glass-border)]/55 bg-white/55 hover:border-[var(--glass-border)]/80 hover:bg-white/72',
  ].join(' ')
}

export function getCreateWorkspaceStepBadgeClass(active: boolean): string {
  return active
    ? 'min-w-0 rounded-2xl border border-[var(--glass-primary)]/20 bg-[var(--glass-primary)]/18 px-3 py-2 text-left text-[11px] font-semibold leading-4 text-[var(--glass-text-primary)] shadow-[0_6px_18px_rgba(76,166,255,0.14)]'
    : 'min-w-0 rounded-2xl border border-[var(--glass-border)]/35 bg-[var(--glass-bg-muted)]/70 px-3 py-2 text-left text-[11px] font-medium leading-4 text-[var(--glass-text-tertiary)]'
}
