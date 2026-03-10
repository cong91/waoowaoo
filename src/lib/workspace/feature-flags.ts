const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on'])
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off', ''])

export function isWorkspaceDualJourneyEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_WORKSPACE_DUAL_JOURNEY_ENABLED

  // Dual-journey is the current default product scope.
  // Missing env should not hide Manga/Webtoon entry lanes in UI.
  if (typeof raw !== 'string') return true

  const normalized = raw.trim().toLowerCase()
  if (TRUE_VALUES.has(normalized)) return true
  if (FALSE_VALUES.has(normalized)) return false

  // Unknown values fall back to enabled for safer UX discovery.
  return true
}
