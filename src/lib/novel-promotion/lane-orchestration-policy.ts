import type { ProductEntryIntent, ProductJourneyType } from '@/lib/workspace/project-mode'
import type { OnboardingSourceType } from '@/lib/workspace/onboarding-context'
import type { GenerationStage } from '@/lib/workspace/journey-generation-runtime'
import { PROMPT_IDS, type PromptId } from '@/lib/prompt-i18n'

type AnyObj = Record<string, unknown>

export type LaneOrchestrationMetadata = {
  runtimeLane: ProductJourneyType
  stageProfile?: GenerationStage
  entryIntent?: ProductEntryIntent
  sourceType?: OnboardingSourceType
}

export type LaneModelPolicyAdjustments = {
  temperature?: number
  reasoning?: boolean
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high'
}

function asObject(value: unknown): AnyObj {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as AnyObj
}

function normalizeEntryIntent(value: unknown): ProductEntryIntent | undefined {
  return value === 'film_story_studio'
    || value === 'video_ad_short'
    || value === 'cinematic_scene'
    || value === 'manga_quickstart'
    || value === 'manga_story_to_panels'
    ? value
    : undefined
}

function normalizeSourceType(value: unknown): OnboardingSourceType | undefined {
  return value === 'blank' || value === 'story_text' || value === 'import_script'
    ? value
    : undefined
}

function normalizeStageProfile(value: unknown): GenerationStage | undefined {
  return value === 'story_to_script' || value === 'script_to_storyboard'
    ? value
    : undefined
}

function laneFromEntryIntent(entryIntent?: ProductEntryIntent): ProductJourneyType {
  if (entryIntent === 'manga_quickstart' || entryIntent === 'manga_story_to_panels') {
    return 'manga_webtoon'
  }
  return 'film_video'
}

export function resolveLaneOrchestrationMetadata(payload: unknown): LaneOrchestrationMetadata {
  const obj = asObject(payload)
  const meta = asObject(obj.meta)

  const entryIntent = normalizeEntryIntent(obj.entryIntent ?? meta.entryIntent)
  const sourceType = normalizeSourceType(obj.sourceType ?? meta.sourceType)
  const stageProfile = normalizeStageProfile(obj.stageProfile ?? meta.stageProfile)

  const runtimeLaneRaw = obj.runtimeLane ?? meta.runtimeLane
  const runtimeLane = runtimeLaneRaw === 'manga_webtoon' || runtimeLaneRaw === 'film_video'
    ? runtimeLaneRaw
    : laneFromEntryIntent(entryIntent)

  return {
    runtimeLane,
    stageProfile,
    entryIntent,
    sourceType,
  }
}

export function resolveLaneModelPolicyAdjustments(input: LaneOrchestrationMetadata): LaneModelPolicyAdjustments {
  if (input.runtimeLane === 'manga_webtoon') {
    if (input.entryIntent === 'manga_quickstart' && input.sourceType === 'blank') {
      return {
        temperature: 0.74,
        reasoning: true,
        reasoningEffort: 'high',
      }
    }

    if (input.sourceType === 'import_script') {
      return {
        temperature: 0.56,
        reasoning: true,
        reasoningEffort: 'medium',
      }
    }

    if (input.stageProfile === 'script_to_storyboard') {
      return {
        temperature: 0.7,
        reasoning: true,
        reasoningEffort: 'high',
      }
    }

    return {
      temperature: 0.66,
      reasoning: true,
      reasoningEffort: 'high',
    }
  }

  if (input.entryIntent === 'video_ad_short') {
    return {
      temperature: 0.76,
      reasoning: true,
      reasoningEffort: 'low',
    }
  }

  if (input.sourceType === 'import_script') {
    return {
      temperature: 0.58,
      reasoning: true,
      reasoningEffort: 'medium',
    }
  }

  return {
    temperature: 0.7,
    reasoning: true,
    reasoningEffort: 'medium',
  }
}

const MANGA_PROMPT_ID_SET = new Set<PromptId>([
  PROMPT_IDS.MW_AGENT_CLIP,
  PROMPT_IDS.MW_AGENT_STORYBOARD_PLAN,
  PROMPT_IDS.MW_PANEL_IMAGE_PROMPT,
  PROMPT_IDS.MW_IMAGE_PROMPT_MODIFY,
])

const FILM_PROMPT_ID_SET = new Set<PromptId>([
  PROMPT_IDS.NP_AGENT_CLIP,
  PROMPT_IDS.NP_AGENT_STORYBOARD_PLAN,
  PROMPT_IDS.NP_SINGLE_PANEL_IMAGE,
  PROMPT_IDS.NP_IMAGE_PROMPT_MODIFY,
])

export function assertLanePromptInvariant(input: {
  runtimeLane: ProductJourneyType
  promptId: PromptId
  stage: string
}) {
  const { runtimeLane, promptId, stage } = input
  if (runtimeLane === 'manga_webtoon' && !MANGA_PROMPT_ID_SET.has(promptId)) {
    throw new Error(
      `LANE_PROMPT_INVARIANT_VIOLATION: lane=${runtimeLane} stage=${stage} promptId=${promptId} is not manga-webtoon scoped`,
    )
  }

  if (runtimeLane === 'film_video' && !FILM_PROMPT_ID_SET.has(promptId)) {
    throw new Error(
      `LANE_PROMPT_INVARIANT_VIOLATION: lane=${runtimeLane} stage=${stage} promptId=${promptId} is not film-video scoped`,
    )
  }
}

export function resolveLanePromptId(input: {
  metadata: LaneOrchestrationMetadata
  filmPromptId: PromptId
  mangaPromptId: PromptId
  stage: string
}): PromptId {
  const promptId = input.metadata.runtimeLane === 'manga_webtoon'
    ? input.mangaPromptId
    : input.filmPromptId

  assertLanePromptInvariant({
    runtimeLane: input.metadata.runtimeLane,
    promptId,
    stage: input.stage,
  })

  return promptId
}

export function buildLanePromptDirective(input: LaneOrchestrationMetadata): string {
  if (input.runtimeLane === 'manga_webtoon') {
    const sourceDirective = input.sourceType === 'import_script'
      ? 'Honor imported script beats; only adapt into manga panel language without cinematic rewrite.'
      : input.sourceType === 'story_text'
        ? 'Convert prose into manga/webtoon panel progression with clear visual beats.'
        : 'Create a manga/webtoon-first concept flow with strong hook and panel readability.'

    const intentDirective = input.entryIntent === 'manga_quickstart'
      ? 'Prioritize fast ideation and readable panel rhythm for quickstart creators.'
      : 'Prioritize continuity-safe story-to-panels conversion for manga/webtoon production.'

    return [
      '[DualJourney Policy]',
      'Lane=manga_webtoon. Keep outputs manga/webtoon native; avoid film/video shot-list bias.',
      sourceDirective,
      intentDirective,
    ].join('\n')
  }

  const filmIntentDirective = input.entryIntent === 'video_ad_short'
    ? 'Optimize for short-form ad pacing and concise scene transitions.'
    : input.entryIntent === 'cinematic_scene'
      ? 'Optimize for cinematic scene depth and visual continuity.'
      : 'Optimize for film/video storytelling clarity.'

  const sourceDirective = input.sourceType === 'import_script'
    ? 'Respect imported script structure and preserve scene intent.'
    : input.sourceType === 'story_text'
      ? 'Adapt story text into film/video scene language with explicit visual continuity.'
      : 'Build film/video concept from blank input with coherent scene intent.'

  return [
    '[DualJourney Policy]',
    'Lane=film_video. Keep outputs aligned with film/video production semantics.',
    filmIntentDirective,
    sourceDirective,
  ].join('\n')
}
