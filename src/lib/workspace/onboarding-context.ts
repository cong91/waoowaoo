import {
  type ProductEntryIntent,
  type ProductJourneyType,
} from '@/lib/workspace/project-mode'

export type OnboardingSourceType = 'blank' | 'story_text' | 'import_script'
export type OnboardingCharacterStrategyId = 'consistency-first' | 'emotion-first' | 'dynamic-action'
export type OnboardingEnvironmentPresetId = 'city-night-neon' | 'forest-mist-dawn' | 'interior-cinematic'
export type OnboardingPromptMode = 'guided' | 'advanced'

export interface WorkspaceOnboardingContext {
  journeyType?: ProductJourneyType
  entryIntent?: ProductEntryIntent
  sourceType: OnboardingSourceType
  sourceContent?: string
  stylePresetId?: string
  characterStrategyId?: OnboardingCharacterStrategyId
  environmentPresetId?: OnboardingEnvironmentPresetId
  promptMode?: OnboardingPromptMode
  referenceBoardSelections?: string[]
  capturedAt: string
}

const ONBOARDING_CONTEXT_KEY = '__workspaceOnboardingContext'

function parseJsonObject(input: string | null | undefined): Record<string, unknown> {
  if (!input || !input.trim()) return {}
  try {
    const parsed = JSON.parse(input)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return {}
  } catch {
    return {}
  }
}

function normalizeSourceType(value: unknown): OnboardingSourceType {
  if (value === 'story_text' || value === 'import_script') return value
  return 'blank'
}

function normalizeCharacterStrategyId(value: unknown): OnboardingCharacterStrategyId | undefined {
  if (value === 'emotion-first' || value === 'dynamic-action') return value
  if (value === 'consistency-first') return value
  return undefined
}

function normalizeEnvironmentPresetId(value: unknown): OnboardingEnvironmentPresetId | undefined {
  if (value === 'forest-mist-dawn' || value === 'interior-cinematic') return value
  if (value === 'city-night-neon') return value
  return undefined
}

function normalizePromptMode(value: unknown): OnboardingPromptMode {
  return value === 'advanced' ? 'advanced' : 'guided'
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeReferenceBoardSelections(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const normalized = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  return normalized.length > 0 ? normalized : undefined
}

export function buildWorkspaceOnboardingContext(input: {
  journeyType?: ProductJourneyType
  entryIntent?: ProductEntryIntent
  sourceType?: unknown
  sourceContent?: unknown
  stylePresetId?: unknown
  characterStrategyId?: unknown
  environmentPresetId?: unknown
  promptMode?: unknown
  referenceBoardSelections?: unknown
}): WorkspaceOnboardingContext {
  const sourceType = normalizeSourceType(input.sourceType)
  const sourceContentRaw = typeof input.sourceContent === 'string' ? input.sourceContent.trim() : ''

  return {
    journeyType: input.journeyType,
    entryIntent: input.entryIntent,
    sourceType,
    sourceContent: sourceType === 'blank' || sourceContentRaw.length === 0 ? undefined : sourceContentRaw,
    stylePresetId: normalizeOptionalString(input.stylePresetId),
    characterStrategyId: normalizeCharacterStrategyId(input.characterStrategyId),
    environmentPresetId: normalizeEnvironmentPresetId(input.environmentPresetId),
    promptMode: normalizePromptMode(input.promptMode),
    referenceBoardSelections: normalizeReferenceBoardSelections(input.referenceBoardSelections),
    capturedAt: new Date().toISOString(),
  }
}

export function mergeWorkspaceOnboardingContextIntoCapabilityOverrides(input: {
  existingCapabilityOverrides?: string | null
  onboardingContext: WorkspaceOnboardingContext
}): string {
  const parsed = parseJsonObject(input.existingCapabilityOverrides)
  parsed[ONBOARDING_CONTEXT_KEY] = input.onboardingContext
  return JSON.stringify(parsed)
}

export function readWorkspaceOnboardingContextFromCapabilityOverrides(
  capabilityOverrides?: string | null,
): WorkspaceOnboardingContext | null {
  const parsed = parseJsonObject(capabilityOverrides)
  const context = parsed[ONBOARDING_CONTEXT_KEY]
  if (!context || typeof context !== 'object' || Array.isArray(context)) return null

  const sourceType = normalizeSourceType((context as Record<string, unknown>).sourceType)
  const sourceContentRaw = (context as Record<string, unknown>).sourceContent
  const sourceContent = typeof sourceContentRaw === 'string' && sourceContentRaw.trim().length > 0
    ? sourceContentRaw
    : undefined

  const journeyTypeRaw = (context as Record<string, unknown>).journeyType
  const entryIntentRaw = (context as Record<string, unknown>).entryIntent
  const capturedAtRaw = (context as Record<string, unknown>).capturedAt
  const stylePresetIdRaw = (context as Record<string, unknown>).stylePresetId
  const characterStrategyIdRaw = (context as Record<string, unknown>).characterStrategyId
  const environmentPresetIdRaw = (context as Record<string, unknown>).environmentPresetId
  const promptModeRaw = (context as Record<string, unknown>).promptMode
  const referenceBoardSelectionsRaw = (context as Record<string, unknown>).referenceBoardSelections

  return {
    sourceType,
    sourceContent,
    journeyType: journeyTypeRaw === 'film_video' || journeyTypeRaw === 'manga_webtoon' ? journeyTypeRaw : undefined,
    entryIntent: entryIntentRaw === 'film_story_studio'
      || entryIntentRaw === 'video_ad_short'
      || entryIntentRaw === 'cinematic_scene'
      || entryIntentRaw === 'manga_quickstart'
      || entryIntentRaw === 'manga_story_to_panels'
      ? entryIntentRaw
      : undefined,
    stylePresetId: normalizeOptionalString(stylePresetIdRaw),
    characterStrategyId: normalizeCharacterStrategyId(characterStrategyIdRaw),
    environmentPresetId: normalizeEnvironmentPresetId(environmentPresetIdRaw),
    promptMode: normalizePromptMode(promptModeRaw),
    referenceBoardSelections: normalizeReferenceBoardSelections(referenceBoardSelectionsRaw),
    capturedAt: typeof capturedAtRaw === 'string' && capturedAtRaw ? capturedAtRaw : new Date(0).toISOString(),
  }
}
