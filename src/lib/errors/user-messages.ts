import type { UnifiedErrorCode } from './codes'
import enErrors from '../../../messages/en/errors.json'
import zhErrors from '../../../messages/zh/errors.json'
import viErrors from '../../../messages/vi/errors.json'
import koErrors from '../../../messages/ko/errors.json'

/**
 * Multi-locale user-facing error messages.
 * Used by non-React utility code (display.ts, error-utils.ts, task/error-message.ts).
 * For React components, prefer useTranslations('errors') from next-intl.
 */
const USER_ERROR_MESSAGES: Record<string, Record<string, string>> = {
  en: enErrors,
  zh: zhErrors,
  vi: viErrors,
  ko: koErrors,
}

let _currentLocale: string = 'en'

function normalizeLocale(locale?: string): string {
  if (!locale) return 'en'
  const normalized = locale.toLowerCase().split('-')[0]
  return USER_ERROR_MESSAGES[normalized] ? normalized : 'en'
}

/**
 * Set the current locale for error message resolution.
 * Call this early in request lifecycle (e.g., middleware or layout).
 */
export function setErrorMessageLocale(locale: string) {
  _currentLocale = normalizeLocale(locale)
}

/**
 * Get the current locale used for error messages.
 */
export function getErrorMessageLocale(): string {
  return _currentLocale
}

/**
 * Get a user-friendly error message by error code, using the current locale.
 * Falls back to English if the locale is not found.
 */
export function getUserMessageByCode(code: UnifiedErrorCode, locale?: string): string {
  const loc = normalizeLocale(locale || _currentLocale)
  const messages = USER_ERROR_MESSAGES[loc] || USER_ERROR_MESSAGES.en
  return messages?.[code] || USER_ERROR_MESSAGES.en?.[code] || code
}
