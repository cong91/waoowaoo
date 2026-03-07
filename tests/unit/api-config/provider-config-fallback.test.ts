import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  userPreference: {
    findUnique: vi.fn(),
  },
}))

const decryptApiKeyMock = vi.hoisted(() => vi.fn((value: string) => `decrypted:${value}`))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

vi.mock('@/lib/crypto-utils', () => ({
  decryptApiKey: decryptApiKeyMock,
}))

import { getProviderConfig } from '@/lib/api-config'

const ORIGINAL_ENV = { ...process.env }

function resetEnv() {
  process.env = { ...ORIGINAL_ENV }
  delete process.env.OPENAI_COMPAT_BASE_URL
  delete process.env.OPENAI_COMPAT_API_KEY
  delete process.env.OPENAI_COMPAT_EXTRA_HEADERS_JSON
  delete process.env.OPENAI_COMPAT_API_MODE
  delete process.env.OPENROUTER_BASE_URL
  delete process.env.OPENROUTER_API_KEY
}

describe('api-config provider fallback + no-key strategy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetEnv()
    prismaMock.userPreference.findUnique.mockResolvedValue({
      customModels: '[]',
      customProviders: '[]',
    })
  })

  it('supports OPENAI-compatible env fallback without api key and with custom headers', async () => {
    process.env.OPENAI_COMPAT_BASE_URL = 'https://proxy.example.com/openai'
    process.env.OPENAI_COMPAT_API_KEY = ''
    process.env.OPENAI_COMPAT_EXTRA_HEADERS_JSON = '{"x-proxy-token":"abc123"}'

    const config = await getProviderConfig('user-1', 'openai-compatible')

    expect(config.id).toBe('openai-compatible')
    expect(config.baseUrl).toBe('https://proxy.example.com/openai/v1')
    expect(config.apiKey).toBe('')
    expect(config.extraHeaders).toEqual({ 'x-proxy-token': 'abc123' })
    expect(decryptApiKeyMock).not.toHaveBeenCalled()
  })

  it('keeps OpenRouter strict api key requirement (fallback mode)', async () => {
    process.env.OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
    process.env.OPENROUTER_API_KEY = ''

    await expect(getProviderConfig('user-1', 'openrouter')).rejects.toThrow('PROVIDER_API_KEY_MISSING')
  })

  it('merges env extra headers with stored openai-compatible provider config', async () => {
    prismaMock.userPreference.findUnique.mockResolvedValue({
      customModels: '[]',
      customProviders: JSON.stringify([
        {
          id: 'openai-compatible:oa-1',
          name: 'OpenAI Compat A',
          baseUrl: 'https://gateway.example.com/custom',
          apiKey: '',
          extraHeaders: { 'x-team': 'vat' },
        },
      ]),
    })
    process.env.OPENAI_COMPAT_EXTRA_HEADERS_JSON = '{"x-env":"from-env"}'

    const config = await getProviderConfig('user-1', 'openai-compatible:oa-1')

    expect(config.baseUrl).toBe('https://gateway.example.com/custom/v1')
    expect(config.apiKey).toBe('')
    expect(config.extraHeaders).toEqual({
      'x-env': 'from-env',
      'x-team': 'vat',
    })
  })

  it('keeps decrypt flow unchanged for stored OpenRouter provider', async () => {
    prismaMock.userPreference.findUnique.mockResolvedValue({
      customModels: '[]',
      customProviders: JSON.stringify([
        {
          id: 'openrouter',
          name: 'OpenRouter',
          baseUrl: 'https://openrouter.ai/api/v1',
          apiKey: 'enc-openrouter',
        },
      ]),
    })

    const config = await getProviderConfig('user-1', 'openrouter')
    expect(config.apiKey).toBe('decrypted:enc-openrouter')
    expect(decryptApiKeyMock).toHaveBeenCalledWith('enc-openrouter')
  })
})
