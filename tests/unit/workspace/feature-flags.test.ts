import { afterEach, describe, expect, it } from 'vitest'

import { isWorkspaceDualJourneyEnabled } from '@/lib/workspace/feature-flags'

const FLAG_KEY = 'NEXT_PUBLIC_WORKSPACE_DUAL_JOURNEY_ENABLED'

describe('workspace dual journey feature flag', () => {
  afterEach(() => {
    delete process.env[FLAG_KEY]
  })

  it('returns true when env var is missing (dual-journey default)', () => {
    delete process.env[FLAG_KEY]

    expect(isWorkspaceDualJourneyEnabled()).toBe(true)
  })

  it('returns true for enabled values', () => {
    for (const value of ['1', 'true', 'TRUE', 'yes', 'on']) {
      process.env[FLAG_KEY] = value
      expect(isWorkspaceDualJourneyEnabled()).toBe(true)
    }
  })

  it('returns false for disabled values', () => {
    for (const value of ['0', 'false', 'no', 'off', '']) {
      process.env[FLAG_KEY] = value
      expect(isWorkspaceDualJourneyEnabled()).toBe(false)
    }
  })
})
