import { describe, expect, it } from 'vitest'
import {
  buildWebtoonScrollNarrativePreview,
  createAddPayload,
  createDuplicatePayload,
  createMergePayload,
  createReorderPayload,
  createSplitPayloads,
  WEBTOON_PANEL_QUICK_ACTIONS,
} from '@/lib/workspace/webtoon-panel-controls'

describe('webtoon panel controls helpers (VAT-133 P0)', () => {
  it('exposes 5 panel-first quick actions', () => {
    expect(WEBTOON_PANEL_QUICK_ACTIONS.map((x) => x.id)).toEqual([
      'add',
      'duplicate',
      'split',
      'merge',
      'reorder',
    ])
  })

  it('builds dense-six-panel preview with stable shape and normalized heights', () => {
    const preview = buildWebtoonScrollNarrativePreview({
      panelSlotCount: 6,
      layoutFamily: 'dense-six-panel',
    })

    expect(preview).toHaveLength(6)
    expect(preview[0]?.emphasis).toBe('anchor')
    expect(preview[5]?.emphasis).toBe('transition')
    expect(preview.slice(1, -1).every((item) => item.emphasis === 'support')).toBe(true)

    const sum = preview.reduce((acc, item) => acc + item.relativeHeight, 0)
    expect(sum).toBeGreaterThan(0.98)
    expect(sum).toBeLessThan(1.02)
  })

  it('uses fallback weights when layout family is unknown', () => {
    const preview = buildWebtoonScrollNarrativePreview({
      panelSlotCount: 4,
      layoutFamily: 'unknown-family',
    })

    expect(preview).toHaveLength(4)
    expect(preview[0]?.panelIndex).toBe(1)
    expect(preview[3]?.panelIndex).toBe(4)
    expect(preview[0]?.relativeHeight).toBeLessThan(preview[3]?.relativeHeight ?? 0)
  })

  it('builds add payload from anchor panel', () => {
    const payload = createAddPayload({
      anchor: {
        id: 'p1',
        storyboardId: 'sb1',
        panelIndex: 2,
        shotType: 'Close-up',
        cameraMove: 'Static',
        description: 'Anchor beat',
        location: 'Cafe',
        characters: '[{"name":"A"}]',
        srtStart: 1.2,
        srtEnd: 2.8,
        duration: 1.6,
        videoPrompt: 'anchor prompt',
      },
    })

    expect(payload.storyboardId).toBe('sb1')
    expect(payload.shotType).toBe('Close-up')
    expect(payload.description).toBe('Anchor beat')
    expect(payload.characters).toContain('A')
  })

  it('creates split payload pair and keeps duration balanced', () => {
    const [left, right] = createSplitPayloads({
      id: 'p2',
      storyboardId: 'sb1',
      panelIndex: 1,
      description: 'Long beat',
      duration: 5,
      characters: '[]',
    })

    expect(left.description).toContain('Part 1')
    expect(right.description).toContain('Part 2')
    expect((left.duration ?? 0) + (right.duration ?? 0)).toBeCloseTo(5, 3)
  })

  it('creates merge payload with combined description/characters', () => {
    const payload = createMergePayload({
      left: {
        id: 'p3',
        storyboardId: 'sb1',
        panelIndex: 1,
        description: 'Beat A',
        characters: '[{"name":"Hero"}]',
        duration: 1.1,
      },
      right: {
        id: 'p4',
        storyboardId: 'sb1',
        panelIndex: 2,
        description: 'Beat B',
        characters: '[{"name":"Hero"},{"name":"Friend"}]',
        duration: 1.4,
      },
    })

    expect(payload.description).toContain('Beat A')
    expect(payload.description).toContain('Beat B')
    expect(payload.characters).toContain('Hero')
    expect(payload.characters).toContain('Friend')
    expect(payload.duration).toBeCloseTo(2.5, 3)
  })

  it('duplicate/reorder payload helpers keep storyboard continuity shape', () => {
    const panel = {
      id: 'p5',
      storyboardId: 'sb9',
      panelIndex: 0,
      description: 'Beat keep',
      characters: '[]',
      duration: 1,
    }

    const duplicate = createDuplicatePayload(panel)
    const reorder = createReorderPayload(panel)

    expect(duplicate.storyboardId).toBe('sb9')
    expect(reorder.storyboardId).toBe('sb9')
    expect(duplicate.description).toContain('Beat keep')
    expect(reorder.description).toContain('Beat keep')
  })
})
