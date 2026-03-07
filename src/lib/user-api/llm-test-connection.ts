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

function normalizeProvider(payload: TestConnectionPayload): SupportedProvider {
  const provider = typeof payload.provider === 'string' ? payload.provider.trim().toLowerCase() : ''
  if (!provider) {
    if (typeof payload.baseUrl === 'string' && payload.baseUrl.trim()) return 'custom'
    throw new ApiError('INVALID_PARAMS', { message: '缺少必要参数 provider' })
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
      throw new ApiError('INVALID_PARAMS', { message: `不支持的渠道: ${provider}` })
  }
}

function requireApiKey(payload: TestConnectionPayload, options?: { allowEmpty?: boolean }): string {
  const apiKey = typeof payload.apiKey === 'string' ? payload.apiKey.trim() : ''
  if (!apiKey && !options?.allowEmpty) {
    throw new ApiError('INVALID_PARAMS', { message: '缺少必要参数 apiKey' })
  }
  return apiKey
}

function requireBaseUrl(payload: TestConnectionPayload): string {
  const baseUrl = typeof payload.baseUrl === 'string' ? payload.baseUrl.trim() : ''
  if (!baseUrl) {
    throw new ApiError('INVALID_PARAMS', { message: '自定义渠道需要提供 baseUrl' })
  }
  return baseUrl
}

async function testGoogleAI(apiKey: string): Promise<void> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
    { method: 'GET' },
  )
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google AI 认证失败: ${error}`)
  }
}

function parseExtraHeadersJson(value: string | undefined): Record<string, string> | undefined {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new ApiError('INVALID_PARAMS', { message: 'extraHeadersJson 必须是合法 JSON 对象' })
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new ApiError('INVALID_PARAMS', { message: 'extraHeadersJson 必须是对象' })
  }

  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof v !== 'string') {
      throw new ApiError('INVALID_PARAMS', { message: `extraHeadersJson.${k} 必须是字符串` })
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
      messages: [{ role: 'user', content: '1+1等于几？只回答数字' }],
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
      return { provider, message: 'openrouter 连接成功', ...tested }
    }
    case 'google':
      await testGoogleAI(apiKey)
      return { provider, message: 'google 连接成功' }
    case 'anthropic': {
      const tested = await testOpenAICompatibleConnection({
        apiKey,
        baseURL: 'https://api.anthropic.com/v1',
        model: requestedModel || 'claude-3-haiku-20240307',
        defaultHeaders: { 'anthropic-version': '2023-06-01' },
      })
      return { provider, message: 'anthropic 连接成功', ...tested }
    }
    case 'openai': {
      const tested = await testOpenAICompatibleConnection({
        apiKey,
        model: requestedModel || undefined,
      })
      return { provider, message: 'openai 连接成功', ...tested }
    }
    case 'custom': {
      const tested = await testOpenAICompatibleConnection({
        apiKey,
        baseURL: requireBaseUrl(payload),
        model: requestedModel || undefined,
        defaultHeaders: extraHeaders,
      })
      return { provider, message: 'custom 连接成功', ...tested }
    }
    case 'openai-compatible': {
      const tested = await testOpenAICompatibleConnection({
        apiKey,
        baseURL: requireBaseUrl(payload),
        model: requestedModel || process.env.OPENAI_COMPAT_MODEL || undefined,
        defaultHeaders: extraHeaders,
      })
      return { provider, message: 'openai-compatible 连接成功', ...tested }
    }
  }
}
