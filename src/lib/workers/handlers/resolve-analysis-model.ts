import { prisma } from '@/lib/prisma'
import { composeModelKey, parseModelKeyStrict } from '@/lib/model-config-contract'

type ResolveAnalysisModelInput = {
  userId: string
  inputModel?: unknown
  projectAnalysisModel?: unknown
}

function normalizeModelKey(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = parseModelKeyStrict(trimmed)
  if (!parsed) return null
  return composeModelKey(parsed.provider, parsed.modelId)
}

function resolveEnvAnalysisModel(): string | null {
  const textProvider = typeof process.env.TEXT_PROVIDER === 'string'
    ? process.env.TEXT_PROVIDER.trim().toLowerCase()
    : ''

  if (textProvider === 'openai-compatible' || textProvider === 'openai_compatible') {
    const baseUrl = typeof process.env.OPENAI_COMPAT_BASE_URL === 'string'
      ? process.env.OPENAI_COMPAT_BASE_URL.trim()
      : ''
    if (!baseUrl) return null
    const modelId = typeof process.env.OPENAI_COMPAT_MODEL === 'string' && process.env.OPENAI_COMPAT_MODEL.trim()
      ? process.env.OPENAI_COMPAT_MODEL.trim()
      : 'gpt-4.1-mini'
    return composeModelKey('openai-compatible', modelId)
  }

  if (textProvider === 'openrouter') {
    const hasApiKey = typeof process.env.OPENROUTER_API_KEY === 'string' && process.env.OPENROUTER_API_KEY.trim().length > 0
    if (!hasApiKey) return null
    const modelId = typeof process.env.OPENROUTER_MODEL === 'string' && process.env.OPENROUTER_MODEL.trim()
      ? process.env.OPENROUTER_MODEL.trim()
      : 'openai/gpt-4o-mini'
    return composeModelKey('openrouter', modelId)
  }

  return null
}

export async function resolveAnalysisModel(input: ResolveAnalysisModelInput): Promise<string> {
  const modelFromInput = normalizeModelKey(input.inputModel)
  if (modelFromInput) return modelFromInput

  const modelFromProject = normalizeModelKey(input.projectAnalysisModel)
  if (modelFromProject) return modelFromProject

  const userPreference = await prisma.userPreference.findUnique({
    where: { userId: input.userId },
    select: { analysisModel: true },
  })
  const modelFromUserPreference = normalizeModelKey(userPreference?.analysisModel)
  if (modelFromUserPreference) return modelFromUserPreference

  const modelFromEnv = resolveEnvAnalysisModel()
  if (modelFromEnv) return modelFromEnv

  throw new Error('ANALYSIS_MODEL_NOT_CONFIGURED: 请先在设置页面配置分析模型')
}
