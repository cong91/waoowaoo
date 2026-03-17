import {
  buildProjectEntryUrl,
  mapEntryModeToJourneyType,
  mapJourneyTypeToEntryMode,
  toProjectCreatePayload,
  type ProductEntryIntent,
  type ProductJourneyType,
  type ProjectCreatePayload,
  type WorkspaceProjectEntryMode,
} from '@/lib/workspace/project-mode'
import { resolveEntryIntentFromTemplate } from '@/lib/workspace/onboarding-templates'
import { type OnboardingSourceType } from '@/lib/workspace/onboarding-context'

export type JourneySourceType = OnboardingSourceType

export interface JourneyWizardDraft {
  name: string
  description: string
  entryMode: WorkspaceProjectEntryMode
  starterTemplateId?: string
  sourceType: JourneySourceType
  sourceContent?: string
  stylePresetId?: string
  characterStrategyId?: 'consistency-first' | 'emotion-first' | 'dynamic-action'
  environmentPresetId?: 'city-night-neon' | 'forest-mist-dawn' | 'interior-cinematic'
  promptMode?: 'guided' | 'advanced'
  referenceBoardSelections?: string[]
}

export function resolveJourneyEntryIntent(input: {
  journeyType: ProductJourneyType
  entryMode: WorkspaceProjectEntryMode
  templateId?: string
  sourceType: JourneySourceType
}): ProductEntryIntent {
  const templateIntent = resolveEntryIntentFromTemplate({
    entryMode: input.entryMode,
    templateId: input.templateId,
  })

  if (input.journeyType === 'manga_webtoon') {
    return input.sourceType === 'blank' ? 'manga_quickstart' : 'manga_story_to_panels'
  }

  return templateIntent
}

export function toJourneyProjectCreatePayload(draft: JourneyWizardDraft): ProjectCreatePayload {
  const journeyType = mapEntryModeToJourneyType(draft.entryMode)
  const entryIntent = resolveJourneyEntryIntent({
    journeyType,
    entryMode: draft.entryMode,
    templateId: draft.starterTemplateId,
    sourceType: draft.sourceType,
  })

  return {
    ...toProjectCreatePayload({
      name: draft.name,
      description: draft.description,
      entryMode: draft.entryMode,
      journeyType,
      entryIntent,
      sourceType: draft.sourceType,
      sourceContent: draft.sourceContent,
    }),
    stylePresetId: draft.stylePresetId,
    characterStrategyId: draft.characterStrategyId,
    environmentPresetId: draft.environmentPresetId,
    promptMode: draft.promptMode,
    referenceBoardSelections: draft.referenceBoardSelections,
  }
}

export function buildJourneyRuntimeEntryUrl(input: {
  projectId: string
  journeyType: ProductJourneyType
}): string {
  return buildProjectEntryUrl(input.projectId, mapJourneyTypeToEntryMode(input.journeyType))
}
