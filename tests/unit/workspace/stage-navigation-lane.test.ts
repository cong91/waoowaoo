import { describe, expect, it } from 'vitest'
import type { NovelPromotionPanel } from '@/types/project'
import { useWorkspaceStageNavigation } from '@/app/[locale]/workspace/[projectId]/modes/novel-promotion/hooks/useWorkspaceStageNavigation'

describe('useWorkspaceStageNavigation lane identity (VAT-132)', () => {
  const t = (key: string) => key

  const makePanel = (overrides: Partial<NovelPromotionPanel> = {}): NovelPromotionPanel => ({
    id: 'p1',
    storyboardId: 'sb1',
    panelIndex: 0,
    panelNumber: 1,
    shotType: null,
    cameraMove: null,
    description: null,
    location: null,
    characters: null,
    srtSegment: null,
    srtStart: null,
    srtEnd: null,
    duration: null,
    imagePrompt: null,
    imageUrl: null,
    imageMediaId: null,
    imageHistory: null,
    videoPrompt: null,
    firstLastFramePrompt: null,
    videoUrl: null,
    videoGenerationMode: null,
    videoMediaId: null,
    createdAt: '',
    updatedAt: '',
    sceneType: null,
    candidateImages: null,
    linkedToNextPanel: false,
    lipSyncTaskId: null,
    lipSyncVideoUrl: null,
    lipSyncVideoMediaId: null,
    sketchImageUrl: null,
    sketchImageMediaId: null,
    photographyRules: null,
    actingNotes: null,
    previousImageUrl: null,
    previousImageMediaId: null,
    media: null,
    imageMedia: null,
    videoMedia: null,
    lipSyncVideoMedia: null,
    sketchImageMedia: null,
    previousImageMedia: null,
    ...overrides,
  })

  it('keeps manga/webtoon lane wording and panels stage id', () => {
    const items = useWorkspaceStageNavigation({
      isAnyOperationRunning: false,
      episode: { novelText: 'story draft', voiceLines: [] },
      projectCharacterCount: 1,
      episodeStoryboards: [{ panels: [makePanel({ videoUrl: 'https://example.com/video.mp4' })] }],
      journeyType: 'manga_webtoon',
      promptMode: 'guided',
      t,
    })

    expect(items.map((item) => item.id)).toEqual(['config', 'script', 'storyboard', 'panels', 'editor'])
    expect(items[0]?.label).toBe('stages.mangaKickoff')
    expect(items[1]?.label).toBe('stages.panelScript · Guided')
    expect(items[3]?.label).toBe('stages.webtoonPanels')
    expect(items[3]?.status).toBe('ready')
  })

  it('keeps film/video lane wording and videos stage id', () => {
    const items = useWorkspaceStageNavigation({
      isAnyOperationRunning: false,
      episode: { novelText: 'story draft', voiceLines: [] },
      projectCharacterCount: 1,
      episodeStoryboards: [{ panels: [makePanel()] }],
      journeyType: 'film_video',
      promptMode: 'advanced',
      t,
    })

    expect(items.map((item) => item.id)).toEqual(['config', 'script', 'storyboard', 'videos', 'editor'])
    expect(items[0]?.label).toBe('stages.story')
    expect(items[1]?.label).toBe('stages.script · Advanced')
    expect(items[3]?.label).toBe('stages.video')
  })
})
