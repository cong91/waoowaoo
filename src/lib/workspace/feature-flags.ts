export function isWorkspaceDualJourneyEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_WORKSPACE_DUAL_JOURNEY_ENABLED
  if (typeof raw !== 'string') return false

  const normalized = raw.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on'
}
