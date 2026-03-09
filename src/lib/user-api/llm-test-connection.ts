import OpenAI from 'openai'
import { ApiError } from '@/lib/api-errors'

type SupportedProvider =
  | 'openrouter'
  | 'google'
  | 'anthropic'
  | 'openai'
  | 'custom'
  | 'openai-compatible'

type TestConnectionPayload = {
  provider?: string
  apiKey?: string
  baseUrl?: string
  region?: string
  model?: string
  extraHeadersJson?: string
}

export type LlmConnectionTestResult = {
  provider: SupportedProvider
  message: string
  model?: string
  answer?: string
}

const CONNECTION_SUCCESS_MESSAGE: Record<SupportedProvider, string> = {
  openrouter: 'openrouter connection verified',
  google: 'google connection verified',
  anthropic: 'anthropic connection verified',
  openai: 'openai connection verified',
  custom: 'custom connection verified',
  'openai-compatible': 'openai-compatible connection verified',
}

function throwInvalidParams(details: {
  code: string
  message: string
  field?: string
  provider?: string
}): never {
  throw new ApiError('INVALID_PARAMS', details)
}

function normalizeProvider(payload: TestConnectionPayload): SupportedProvider {
  const provider = typeof payload.provider === 'string' ? payload.provider.trim().toLowerCase() : ''
  if (!provider) {
    if (typeof payload.baseUrl === 'string' && payload.baseUrl.trim()) return 'custom'
    throwInvalidParams({
      code: 'CONNECTION_PROVIDER_REQUIRED',
      field: 'provider',
      message: 'provider is required',
    })
  }

  switch (provider) {
    case 'openrouter':
    case 'google':
    case 'anthropic':
    case 'openai':
    case 'custom':
    case 'openai-compatible':
      return provider
    default:
      throwInvalidParams({
        code: 'CONNECTION_PROVIDER_UNSUPPORTED',
        field: 'provider',
        provider,
        message: `provider is not supported: ${provider}`,
      })
  }
}

function requireApiKey(payload: TestConnectionPayload, options?: { allowEmpty?: boolean }): string {
  const apiKey = typeof payload.apiKey === 'string' ? payload.apiKey.trim() : ''
  if (!apiKey && !options?.allowEmpty) {
    throwInvalidParams({
      code: 'CONNECTION_API_KEY_REQUIRED',
      field: 'apiKey',
      message: 'apiKey is required',
    })
  }
  return apiKey
}

function requireBaseUrl(payload: TestConnectionPayload): string {
  const baseUrl = typeof payload.baseUrl === 'string' ? payload.baseUrl.trim() : ''
  if (!baseUrl) {
    throwInvalidParams({
      code: 'CONNECTION_BASE_URL_REQUIRED',
      field: 'baseUrl',
      message: 'baseUrl is required',
    })
  }
  return baseUrl
}

async function testGoogleAI(apiKey: string): Promise<void> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
    { method: 'GET' },
  )
  if (!response.ok) {
    throw new ApiError('EXTERNAL_ERROR', {
      code: 'CONNECTION_GOOGLE_AUTH_FAILED',
      provider: 'google',
      message: `google auth failed with status ${response.status}`,
      upstreamStatus: response.status,
    })
  }
}

function parseExtraHeadersJson(value: string | undefined): Record<string, string> | undefined {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throwInvalidParams({
      code: 'CONNECTION_EXTRA_HEADERS_JSON_INVALID',
      field: 'extraHeadersJson',
      message: 'extraHeadersJson must be a valid JSON object',
    })
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throwInvalidParams({
      code: 'CONNECTION_EXTRA_HEADERS_TYPE_INVALID',
      field: 'extraHeadersJson',
      message: 'extraHeadersJson must be a JSON object',
    })
  }

  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof v !== 'string') {
      throwInvalidParams({
        code: 'CONNECTION_EXTRA_HEADER_VALUE_INVALID',
        field: `extraHeadersJson.${k}`,
        message: `extraHeadersJson.${k} must be a string`,
      })
    }
    const key = k.trim()
    const val = v.trim()
    if (!key || !val) continue
    out[key] = val
  }
  return Object.keys(out).length > 0 ? out : undefined
}

async function testOpenAICompatibleConnection(params: {
  apiKey: string
  baseURL?: string
  model?: string
  defaultHeaders?: Record<string, string>
}): Promise<Pick<LlmConnectionTestResult, 'model' | 'answer'>> {
  const client = new OpenAI({
    apiKey: params.apiKey || 'no-key',
    baseURL: params.baseURL,
    timeout: 30000,
    defaultHeaders: params.defaultHeaders,
  })

  if (params.model) {
    const response = await client.chat.completions.create({
      model: params.model,
      messages: [{ role: 'user', content: 'What is 1+1? Reply with number only.' }],
      max_tokens: 10,
      temperature: 0,
    })
    const answer = response.choices[0]?.message?.content?.trim() || ''
    return {
      model: response.model || params.model,
      answer,
    }
  }

  await client.models.list()
  return {}
}

export async function testLlmConnection(payload: TestConnectionPayload): Promise<LlmConnectionTestResult> {
  const provider = normalizeProvider(payload)
  const apiKey = requireApiKey(payload, { allowEmpty: provider === 'custom' || provider === 'openai-compatible' })
  const requestedModel = typeof payload.model === 'string' ? payload.model.trim() : ''
  const extraHeaders = parseExtraHeadersJson(payload.extraHeadersJson)

  switch (provider) {
    case 'openrouter': {
      const tested = await testOpenAICompatibleConnection({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        model: requestedModel || undefined,
      })
      return { provider, message: CONNECTION_SUCCESS_MESSAGE[provider], ...tested }
    }
    case 'google':
      await testGoogleAI(apiKey)
      return { provider, message: CONNECTION_SUCCESS_MESSAGE[provider] }
    case 'anthropic': {
      const tested = await testOpenAICompatibleConnection({
        apiKey,
        baseURL: 'https://api.anthropic.com/v1',
        model: requestedModel || 'claude-3-haiku-20240307',
        defaultHeaders: { 'anthropic-version': '2023-06-01' },
      })
      return { provider, message: CONNECTION_SUCCESS_MESSAGE[provider], ...tested }
    }
    case 'openai': {
      const tested = await testOpenAICompatibleConnection({
        apiKey,
        model: requestedModel || undefined,
      })
      return { provider, message: CONNECTION_SUCCESS_MESSAGE[provider], ...tested }
    }
    case 'custom': {
      const tested = await testOpenAICompatibleConnection({
        apiKey,
        baseURL: requireBaseUrl(payload),
        model: requestedModel || undefined,
        defaultHeaders: extraHeaders,
      })
      return { provider, message: CONNECTION_SUCCESS_MESSAGE[provider], ...tested }
    }
    case 'openai-compatible': {
      const tested = await testOpenAICompatibleConnection({
        apiKey,
        baseURL: requireBaseUrl(payload),
        model: requestedModel || process.env.OPENAI_COMPAT_MODEL || undefined,
        defaultHeaders: extraHeaders,
      })
      return { provider, message: CONNECTION_SUCCESS_MESSAGE[provider], ...tested }
    }
  }
}
