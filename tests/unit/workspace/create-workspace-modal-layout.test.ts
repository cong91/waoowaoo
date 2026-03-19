import { describe, expect, it } from 'vitest'

import {
  CREATE_WORKSPACE_MODAL_BODY_CLASS,
  CREATE_WORKSPACE_MODAL_FOOTER_CLASS,
  CREATE_WORKSPACE_MODAL_SURFACE_CLASS,
  CREATE_WORKSPACE_OPTION_GRID_CLASS,
  CREATE_WORKSPACE_STEP_GRID_CLASS,
  getCreateWorkspaceOptionCardClass,
  getCreateWorkspaceStepBadgeClass,
} from '@/lib/workspace/create-modal-layout'

describe('create workspace modal layout', () => {
  it('uses a viewport-safe modal shell with internal scrolling instead of overflow growth', () => {
    expect(CREATE_WORKSPACE_MODAL_SURFACE_CLASS).toContain('max-w-[min(960px,calc(100vw-1rem))]')
    expect(CREATE_WORKSPACE_MODAL_SURFACE_CLASS).toContain('max-h-[min(92vh,860px)]')
    expect(CREATE_WORKSPACE_MODAL_SURFACE_CLASS).toContain('overflow-hidden')
  })

  it('keeps the modal body scrollable while footer actions stay visually anchored', () => {
    expect(CREATE_WORKSPACE_MODAL_BODY_CLASS).toContain('overflow-y-auto')
    expect(CREATE_WORKSPACE_MODAL_FOOTER_CLASS).toContain('sticky')
    expect(CREATE_WORKSPACE_MODAL_FOOTER_CLASS).toContain('bottom-0')
  })

  it('keeps studio choice cards resilient to long copy without horizontal spill', () => {
    expect(CREATE_WORKSPACE_OPTION_GRID_CLASS).toBe('grid grid-cols-1 gap-3')

    const activeCardClass = getCreateWorkspaceOptionCardClass(true)
    const inactiveCardClass = getCreateWorkspaceOptionCardClass(false)

    expect(activeCardClass).toContain('min-h-[112px]')
    expect(activeCardClass).toContain('min-w-0')
    expect(activeCardClass).toContain('ring-2')
    expect(inactiveCardClass).toContain('hover:border-[var(--glass-border)]/80')
  })

  it('renders step badges in a wrapped grid with a calmer inactive state and emphasized active state', () => {
    expect(CREATE_WORKSPACE_STEP_GRID_CLASS).toContain('sm:grid-cols-3')
    expect(getCreateWorkspaceStepBadgeClass(true)).toContain('bg-[var(--glass-primary)]/18')
    expect(getCreateWorkspaceStepBadgeClass(true)).toContain('text-left')
    expect(getCreateWorkspaceStepBadgeClass(false)).toContain('bg-[var(--glass-bg-muted)]/70')
  })
})
