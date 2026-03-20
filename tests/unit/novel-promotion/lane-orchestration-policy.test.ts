import { describe, expect, it } from 'vitest'
import {
  assertLanePromptInvariant,
  resolveLanePromptId,
  resolveLaneOrchestrationMetadata,
} from '@/lib/novel-promotion/lane-orchestration-policy'
import { PROMPT_IDS } from '@/lib/prompt-i18n'

describe('lane-orchestration-policy prompt invariant', () => {
  it('manga lane accepts manga prompt ids and rejects film prompt ids', () => {
    expect(() => {
      assertLanePromptInvariant({
        runtimeLane: 'manga_webtoon',
        promptId: PROMPT_IDS.MW_PANEL_IMAGE_PROMPT,
        stage: 'panel_image_prompt',
      })
    }).not.toThrow()

    expect(() => {
      assertLanePromptInvariant({
        runtimeLane: 'manga_webtoon',
        promptId: PROMPT_IDS.NP_SINGLE_PANEL_IMAGE,
        stage: 'panel_image_prompt',
      })
    }).toThrow('LANE_PROMPT_INVARIANT_VIOLATION')
  })

  it('film lane accepts film prompt ids and rejects manga prompt ids', () => {
    expect(() => {
      assertLanePromptInvariant({
        runtimeLane: 'film_video',
        promptId: PROMPT_IDS.NP_AGENT_CLIP,
        stage: 'story_to_script_clip_prompt',
      })
    }).not.toThrow()

    expect(() => {
      assertLanePromptInvariant({
        runtimeLane: 'film_video',
        promptId: PROMPT_IDS.MW_AGENT_CLIP,
        stage: 'story_to_script_clip_prompt',
      })
    }).toThrow('LANE_PROMPT_INVARIANT_VIOLATION')
  })

  it('resolveLanePromptId uses metadata lane and keeps invariant enforced', () => {
    const metadata = resolveLaneOrchestrationMetadata({
      runtimeLane: 'manga_webtoon',
      stageProfile: 'story_to_script',
      entryIntent: 'manga_quickstart',
      sourceType: 'story_text',
    })

    const promptId = resolveLanePromptId({
      metadata,
      filmPromptId: PROMPT_IDS.NP_AGENT_CLIP,
      mangaPromptId: PROMPT_IDS.MW_AGENT_CLIP,
      stage: 'story_to_script_clip_prompt',
    })

    expect(promptId).toBe(PROMPT_IDS.MW_AGENT_CLIP)
  })
})
