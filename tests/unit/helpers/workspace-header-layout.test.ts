import { describe, expect, it } from 'vitest'

import { resolveWorkspaceHeaderLayoutModel } from '@/lib/workspace/workspace-header-layout'

describe('resolveWorkspaceHeaderLayoutModel', () => {
  it('returns desktop inline layout with no mobile trigger', () => {
    const model = resolveWorkspaceHeaderLayoutModel(false)

    expect(model).toMatchObject({
      isMobile: false,
      showInlineEpisodeSelector: true,
      showInlineCapsuleNav: true,
      showInlineTopActions: true,
      showMobileMenuTrigger: false,
      useDesktopVerticalStageRail: true,
      contentSpacingClass: 'pt-4 sm:pt-5',
    })
  })

  it('returns mobile drawer layout with hidden inline navigation surfaces', () => {
    const model = resolveWorkspaceHeaderLayoutModel(true)

    expect(model).toMatchObject({
      isMobile: true,
      showInlineEpisodeSelector: false,
      showInlineCapsuleNav: false,
      showInlineTopActions: false,
      showMobileMenuTrigger: true,
      useDesktopVerticalStageRail: false,
      contentSpacingClass: 'pt-4 sm:pt-5',
    })
  })
})
