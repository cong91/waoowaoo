import { describe, expect, it } from 'vitest'
import {
  buildMangaPanelTemplateNarrativeBeats,
  getMangaPanelTemplateProductSemantics,
  getMangaPanelTemplateReadingLabel,
  getMangaPanelTemplateSelectorLabel,
  getMangaPanelTemplateSelectorSummary,
  getMangaPanelTemplateSemanticSummary,
  MANGA_PANEL_TEMPLATE_SPECS,
} from '@/lib/workspace/manga-webtoon-layout-map'

describe('manga panel template contract (VAT-164 / VAT-169 / VAT-172)', () => {
  it('keeps all panel templates portrait page-layout assets with contain preview semantics', () => {
    expect(MANGA_PANEL_TEMPLATE_SPECS.length).toBeGreaterThanOrEqual(10)

    for (const spec of MANGA_PANEL_TEMPLATE_SPECS) {
      expect(spec.metadata.category).toBe('manga-page-layout-template')
      expect(spec.metadata.orientation).toBe('portrait')
      expect(spec.metadata.previewFit).toBe('contain')
      expect(spec.metadata.aspectRatio).toBe('2:3')
      expect(spec.metadata.sourceHeight).toBeGreaterThan(spec.metadata.sourceWidth)
      expect(spec.metadata.panelSlotCount).toBeGreaterThan(0)
      expect(spec.metadata.emphasisPattern.length).toBeGreaterThan(0)
      expect(spec.metadata.imagePath).toContain('/images/anifun/panel-templates/')
    }
  })

  it('exposes semantic summaries and reading labels for selector/UI copy', () => {
    const splash = MANGA_PANEL_TEMPLATE_SPECS.find((item) => item.id === 'anifun-t04-single-splash')
    const dense = MANGA_PANEL_TEMPLATE_SPECS.find((item) => item.id === 'anifun-t10-dense-six-panel')

    expect(splash).toBeTruthy()
    expect(dense).toBeTruthy()

    expect(getMangaPanelTemplateSemanticSummary(splash!)).toContain('1 panels')
    expect(getMangaPanelTemplateSemanticSummary(dense!)).toContain('6 panels')
    expect(getMangaPanelTemplateReadingLabel(splash!)).toBe('Top-to-bottom')
  })

  it('provides selector/product semantics for VAT-171 naming and copy normalization', () => {
    const template = MANGA_PANEL_TEMPLATE_SPECS.find((item) => item.id === 'anifun-t05-dual-split')

    expect(template).toBeTruthy()
    expect(getMangaPanelTemplateSelectorLabel(template!)).toBe('Dual Split · 2 panels')
    expect(getMangaPanelTemplateSelectorSummary(template!)).toContain('setup-payoff')
    expect(getMangaPanelTemplateProductSemantics(template!)).toContain('Manga page layout template')
  })

  it('maps template panel slots into deterministic narrative beats for VAT-170 prompt flow', () => {
    const dense = MANGA_PANEL_TEMPLATE_SPECS.find((item) => item.id === 'anifun-t10-dense-six-panel')

    expect(dense).toBeTruthy()

    const beats = buildMangaPanelTemplateNarrativeBeats(dense!)
    expect(beats).toHaveLength(dense!.metadata.panelSlotCount)
    expect(beats[0]).toMatchObject({ slot: 1, beat: 'opening' })
    expect(beats[beats.length - 1]).toMatchObject({ slot: dense!.metadata.panelSlotCount, beat: 'payoff' })
  })
})
