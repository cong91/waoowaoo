import { beforeEach, describe, expect, it, vi } from 'vitest'

const openAIState = vi.hoisted(() => ({
  create: vi.fn(),
  list: vi.fn(),
}))

vi.mock('openai', () => ({
  default: class OpenAI {
    chat = {
      completions: {
        create: openAIState.create,
      },
    }

    models = {
      list: openAIState.list,
    }
  },
}))

import { testLlmConnection } from '@/lib/user-api/llm-test-connection'

describe('user-api llm-test-connection contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    openAIState.create.mockResolvedValue({
      model: 'gpt-4.1-mini',
      choices: [{ message: { content: '2' } }],
    })
    openAIState.list.mockResolvedValue({ data: [] })
  })

  it('accepts openai-compatible without apiKey when baseUrl + extraHeadersJson are provided', async () => {
    const result = await testLlmConnection({
      provider: 'openai-compatible',
      apiKey: '',
      baseUrl: 'https://proxy.example.com/v1',
      model: 'gpt-4.1-mini',
      extraHeadersJson: '{"x-proxy-token":"abc123"}',
    })

    expect(result.provider).toBe('openai-compatible')
    expect(result.message).toBe('openai-compatible connection verified')
    expect(openAIState.create).toHaveBeenCalledTimes(1)
  })

  it('returns english contract error details when provider is missing', async () => {
    await expect(testLlmConnection({})).rejects.toMatchObject({
      code: 'INVALID_PARAMS',
      message: 'provider is required',
      details: {
        code: 'CONNECTION_PROVIDER_REQUIRED',
        field: 'provider',
      },
    })
  })

  it('returns english contract error details when extraHeadersJson is invalid JSON', async () => {
    await expect(
      testLlmConnection({
        provider: 'openai-compatible',
        baseUrl: 'https://proxy.example.com/v1',
        extraHeadersJson: '{invalid-json}',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_PARAMS',
      message: 'extraHeadersJson must be a valid JSON object',
      details: {
        code: 'CONNECTION_EXTRA_HEADERS_JSON_INVALID',
        field: 'extraHeadersJson',
      },
    })
  })
})
