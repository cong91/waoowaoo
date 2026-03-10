import { beforeEach, describe, expect, it } from 'vitest'
import {
  QUICK_MANGA_SESSION_KEY,
  clearQuickMangaSessionPreference,
  readQuickMangaSessionPreference,
  writeQuickMangaSessionPreference,
} from '@/lib/workspace/quick-manga-session'

describe('quick manga session preference helpers', () => {
  const store = new Map<string, string>()
  const sessionStorageMock = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }

  beforeEach(() => {
    ;(globalThis as unknown as { window?: unknown }).window = { sessionStorage: sessionStorageMock }
    sessionStorageMock.clear()
  })

  it('reads null when no session preference exists', () => {
    expect(readQuickMangaSessionPreference()).toBeNull()
  })

  it('writes and reads enabled state', () => {
    writeQuickMangaSessionPreference(true)
    const stored = sessionStorageMock.getItem(QUICK_MANGA_SESSION_KEY)
    expect(stored).toBe('1')
    expect(readQuickMangaSessionPreference()).toBe(true)
  })

  it('writes and reads disabled state and clears correctly', () => {
    writeQuickMangaSessionPreference(false)
    expect(readQuickMangaSessionPreference()).toBe(false)
    clearQuickMangaSessionPreference()
    expect(readQuickMangaSessionPreference()).toBeNull()
  })
})
