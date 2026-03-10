const QUICK_MANGA_SESSION_KEY = 'vat.quickManga.enabled'

export function readQuickMangaSessionPreference(): boolean | null {
  if (typeof window === 'undefined') return null

  const raw = window.sessionStorage.getItem(QUICK_MANGA_SESSION_KEY)
  if (raw === '1') return true
  if (raw === '0') return false
  return null
}

export function writeQuickMangaSessionPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(QUICK_MANGA_SESSION_KEY, enabled ? '1' : '0')
}

export function clearQuickMangaSessionPreference(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(QUICK_MANGA_SESSION_KEY)
}

export { QUICK_MANGA_SESSION_KEY }
