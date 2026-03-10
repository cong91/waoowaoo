const QUICK_MANGA_SESSION_KEY = 'vat.quickManga.enabled'

function getSessionStorageSafe(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function readQuickMangaSessionPreference(): boolean | null {
  const sessionStorageRef = getSessionStorageSafe()
  if (!sessionStorageRef) return null

  const raw = sessionStorageRef.getItem(QUICK_MANGA_SESSION_KEY)
  if (raw === '1') return true
  if (raw === '0') return false
  return null
}

export function writeQuickMangaSessionPreference(enabled: boolean): void {
  const sessionStorageRef = getSessionStorageSafe()
  if (!sessionStorageRef) return

  sessionStorageRef.setItem(QUICK_MANGA_SESSION_KEY, enabled ? '1' : '0')
}

export function clearQuickMangaSessionPreference(): void {
  const sessionStorageRef = getSessionStorageSafe()
  if (!sessionStorageRef) return

  sessionStorageRef.removeItem(QUICK_MANGA_SESSION_KEY)
}

export { QUICK_MANGA_SESSION_KEY }
