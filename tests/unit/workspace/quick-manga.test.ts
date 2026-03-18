import { describe, expect, it } from 'vitest'
import {
  buildQuickMangaStoryInput,
  type QuickMangaOptions,
} from '@/lib/novel-promotion/quick-manga'

describe('quick manga story input builder', () => {
  const baseOptions: QuickMangaOptions = {
    enabled: true,
    preset: 'comedy-4koma',
    layout: 'four-koma',
    colorMode: 'black-white',
  }

  it('prepends directive block when quick manga is enabled', () => {
    const merged = buildQuickMangaStoryInput({
      storyContent: 'A student wakes up late and runs to school.',
      options: baseOptions,
      artStyle: 'american-comic',
    })

    expect(merged).toContain('[QUICK_MANGA_ENTRY]')
    expect(merged).toContain('Preset Input: Comedy 4-koma')
    expect(merged).toContain('Panel Layout Input: 4-koma Rhythm')
    expect(merged).toContain('Panel Layout Resolved: 4-koma Rhythm')
    expect(merged).toContain('Color Mode Input: Black & White')
    expect(merged).toContain('Visual Style: american-comic')
    expect(merged).toContain('[LAYOUT_INTELLIGENCE_V1]')
    expect(merged).toContain('A student wakes up late and runs to school.')
  })

  it('injects template semantics and narrative beats when panel template is selected', () => {
    const merged = buildQuickMangaStoryInput({
      storyContent: 'The hero reveals a clue, tension rises, then the chapter ends on a sharp reaction.',
      options: {
        ...baseOptions,
        panelTemplateId: 'anifun-t10-dense-six-panel',
      },
      artStyle: 'manga-ink',
    })

    expect(merged).toContain('[PANEL_TEMPLATE_V1]')
    expect(merged).toContain('Template Product Semantics: Manga page layout template')
    expect(merged).toContain('Template Selector Summary: montage-investigation')
    expect(merged).toContain('Narrative Beat 1: opening')
    expect(merged).toContain('Narrative Beat 6: payoff')
  })

  it('returns trimmed base content when quick manga is disabled', () => {
    const merged = buildQuickMangaStoryInput({
      storyContent: '   plain story   ',
      options: {
        ...baseOptions,
        enabled: false,
      },
      artStyle: 'american-comic',
    })

    expect(merged).toBe('plain story')
  })
})
