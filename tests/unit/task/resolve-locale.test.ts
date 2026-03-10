import { describe, expect, it } from 'vitest'
import { resolveTaskLocale } from '@/lib/task/resolve-locale'

function buildRequest(acceptLanguage?: string) {
  const headers = new Headers()
  if (acceptLanguage) headers.set('accept-language', acceptLanguage)
  return {
    headers,
  } as unknown as import('next/server').NextRequest
}

describe('resolve task locale', () => {
  it('prefers payload meta.locale over header', () => {
    const request = buildRequest('zh-CN,zh;q=0.9')
    const locale = resolveTaskLocale(request, {
      meta: { locale: 'vi' },
    })
    expect(locale).toBe('vi')
  })

  it('uses payload locale when meta.locale is absent', () => {
    const request = buildRequest('zh-CN,zh;q=0.9')
    const locale = resolveTaskLocale(request, {
      locale: 'ko',
    })
    expect(locale).toBe('ko')
  })

  it('falls back to accept-language when payload has no locale', () => {
    const request = buildRequest('en-US,en;q=0.8')
    const locale = resolveTaskLocale(request, {})
    expect(locale).toBe('en')
  })
})
