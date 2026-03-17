import type { PromptId } from './prompt-ids'
import type {
  PromptLocale,
  PromptPolicyContext,
  PromptRoutingTelemetry,
  PromptTemplateLocale,
} from './types'

const NON_CHINESE_PROVIDER_HINTS = ['openai', 'openrouter', 'anthropic', 'deepseek', 'xai', 'grok']
const CHINESE_PROVIDER_HINTS = ['qwen', 'doubao', 'ark', 'baidu']

type PromptLanguageRoute = {
  templateLocale: PromptTemplateLocale
  outputLocale: PromptLocale
  routeReason: string
  fallbackApplied: boolean
  fallbackReason?: string
}

function normalize(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function includesAny(text: string, hints: readonly string[]): boolean {
  return hints.some((hint) => text.includes(hint))
}

function mapOutputLocale(locale: PromptLocale): PromptLocale {
  if (locale === 'zh') return 'zh'
  if (locale === 'ko') return 'ko'
  if (locale === 'vi') return 'vi'
  return 'en'
}

function mapTemplateLocale(locale: PromptLocale): PromptTemplateLocale {
  if (locale === 'zh') return 'zh'
  if (locale === 'ko') return 'ko'
  if (locale === 'vi') return 'vi'
  return 'en'
}

export function resolvePromptLanguageRoute(input: {
  promptId: PromptId
  locale: PromptLocale
  context?: PromptPolicyContext
}): PromptLanguageRoute {
  const { locale, context } = input
  const preferredOutput = mapOutputLocale(locale)
  const provider = normalize(context?.provider)
  const modelKey = normalize(context?.modelKey)
  const action = normalize(context?.action)
  const taskType = normalize(context?.taskType)

  if (context?.profile === 'en-first') {
    return {
      templateLocale: 'en',
      outputLocale: preferredOutput,
      routeReason: 'profile:en-first',
      fallbackApplied: false,
    }
  }

  if (context?.profile === 'zh-preferred') {
    return {
      templateLocale: 'zh',
      outputLocale: 'zh',
      routeReason: 'profile:zh-preferred',
      fallbackApplied: false,
    }
  }

  const candidateText = `${provider}|${modelKey}|${action}|${taskType}`

  if (preferredOutput !== 'zh') {
    return {
      templateLocale: mapTemplateLocale(preferredOutput),
      outputLocale: preferredOutput,
      routeReason: 'locale:preserve-non-zh',
      fallbackApplied: false,
    }
  }

  if (includesAny(candidateText, CHINESE_PROVIDER_HINTS)) {
    return {
      templateLocale: 'zh',
      outputLocale: 'zh',
      routeReason: 'provider:zh-capable',
      fallbackApplied: false,
    }
  }

  if (includesAny(candidateText, NON_CHINESE_PROVIDER_HINTS)) {
    return {
      templateLocale: 'zh',
      outputLocale: 'zh',
      routeReason: 'provider:non-zh-use-zh-template',
      fallbackApplied: false,
    }
  }

  return {
    templateLocale: 'zh',
    outputLocale: 'zh',
    routeReason: 'default:preserve-zh',
    fallbackApplied: false,
  }
}

export function buildPromptRoutingTelemetry(input: {
  route: PromptLanguageRoute
  contractValid: boolean
}): PromptRoutingTelemetry {
  const { route, contractValid } = input
  return {
    prompt_language: route.templateLocale,
    output_language: route.outputLocale,
    contract_language: 'en',
    contract_valid: contractValid,
    fallback_applied: route.fallbackApplied,
    ...(route.fallbackReason ? { fallback_reason: route.fallbackReason } : {}),
    route_reason: route.routeReason,
  }
}
