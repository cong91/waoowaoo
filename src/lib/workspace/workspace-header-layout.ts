export interface WorkspaceHeaderLayoutModel {
  isMobile: boolean
  showInlineEpisodeSelector: boolean
  showInlineCapsuleNav: boolean
  showInlineTopActions: boolean
  showMobileMenuTrigger: boolean
  useDesktopVerticalStageRail: boolean
  contentSpacingClass: string
}

export function resolveWorkspaceHeaderLayoutModel(isMobile: boolean): WorkspaceHeaderLayoutModel {
  if (isMobile) {
    return {
      isMobile: true,
      showInlineEpisodeSelector: false,
      showInlineCapsuleNav: false,
      showInlineTopActions: false,
      showMobileMenuTrigger: true,
      useDesktopVerticalStageRail: false,
      contentSpacingClass: 'pt-4 sm:pt-5',
    }
  }

  return {
    isMobile: false,
    showInlineEpisodeSelector: true,
    showInlineCapsuleNav: true,
    showInlineTopActions: true,
    showMobileMenuTrigger: false,
    useDesktopVerticalStageRail: true,
    contentSpacingClass: 'pt-4 sm:pt-5',
  }
}
