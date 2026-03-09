import { describe, expect, it } from 'vitest'
import {
  buildQuickMangaContinuityContext,
  buildQuickMangaGenerationControlsFromHistory,
  buildQuickMangaPayloadFromHistory,
  resolveQuickMangaRegenerateStoryContent,
} from '@/lib/novel-promotion/quick-manga-regenerate'

describe('quick manga regenerate helpers', () => {
  it('prefers previous content and marks fallback false', () => {
    const resolved = resolveQuickMangaRegenerateStoryContent({
      previousContent: ' previous content ',
      fallbackContent: 'fallback',
    })

    expect(resolved).toEqual({
      content: 'previous content',
      fallbackUsed: false,
    })
  })

  it('uses fallback content when previous content missing', () => {
    const resolved = resolveQuickMangaRegenerateStoryContent({
      previousContent: '   ',
      fallbackContent: ' fallback ',
    })

    expect(resolved).toEqual({
      content: 'fallback',
      fallbackUsed: true,
    })
  })

  it('normalizes regenerate payload to strict quick manga option enums', () => {
    const payload = buildQuickMangaPayloadFromHistory({
      options: {
        enabled: true,
        preset: 'invalid-preset',
        layout: 'vertical-scroll',
        colorMode: 'invalid-color-mode',
        style: '  manga-ink  ',
      },
    })

    expect(payload).toEqual({
      enabled: true,
      preset: 'auto',
      layout: 'vertical-scroll',
      colorMode: 'auto',
      style: 'manga-ink',
    })
  })

  it('builds generation controls from history source', () => {
    const controls = buildQuickMangaGenerationControlsFromHistory({
      controls: {
        styleLock: {
          enabled: true,
          profile: 'line-consistent',
          strength: 0.75,
        },
        chapterContinuity: {
          mode: 'chapter-flex',
          chapterId: 'ch-03',
          conflictPolicy: 'prefer-chapter-context',
        },
      },
    })

    expect(controls).toEqual({
      styleLock: {
        enabled: true,
        profile: 'line-consistent',
        strength: 0.75,
      },
      chapterContinuity: {
        mode: 'chapter-flex',
        chapterId: 'ch-03',
        conflictPolicy: 'prefer-chapter-context',
      },
    })
  })

  it('builds continuity context from history source', () => {
    const continuity = buildQuickMangaContinuityContext({
      source: {
        runId: 'run-1',
        stage: 'story-to-script',
        options: {
          enabled: true,
          preset: 'action-battle',
          layout: 'cinematic',
          colorMode: 'black-white',
          style: 'ink',
        },
        controls: {
          styleLock: {
            enabled: true,
            profile: 'line-consistent',
            strength: 0.8,
          },
          chapterContinuity: {
            mode: 'chapter-strict',
            chapterId: 'ch-01',
            conflictPolicy: 'prefer-style-lock',
          },
        },
      },
      fallbackContentUsed: true,
    })

    expect(continuity).toEqual({
      sourceRunId: 'run-1',
      sourceStage: 'story-to-script',
      shortcut: 'history-regenerate',
      fallbackContentUsed: true,
      reusedOptions: {
        preset: 'action-battle',
        layout: 'cinematic',
        colorMode: 'black-white',
        style: 'ink',
      },
      reusedControls: {
        styleLock: {
          enabled: true,
          profile: 'line-consistent',
          strength: 0.8,
        },
        chapterContinuity: {
          mode: 'chapter-strict',
          chapterId: 'ch-01',
          conflictPolicy: 'prefer-style-lock',
        },
      },
    })
  })
})
