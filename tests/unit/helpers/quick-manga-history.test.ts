import { describe, expect, it } from 'vitest'
import {
  mapQuickMangaHistoryItem,
  parseQuickMangaHistoryStatusFilter,
  toRunStatuses,
} from '@/lib/novel-promotion/quick-manga-history'
import { RUN_STATUS } from '@/lib/run-runtime/types'

describe('quick manga history helpers', () => {
  it('maps quick manga metadata and stage from run input', () => {
    const item = mapQuickMangaHistoryItem({
      run: {
        id: 'run-1',
        workflowType: 'story_to_script_run',
        taskId: 'task-1',
        episodeId: 'episode-1',
        status: RUN_STATUS.COMPLETED,
        input: {
          quickMangaStage: 'story-to-script',
          quickManga: {
            enabled: true,
            preset: 'action-battle',
            layout: 'cinematic',
            colorMode: 'black-white',
            style: 'manga ink',
          },
          content: 'A'.repeat(260),
        },
        output: {
          summary: {
            text: 'done',
          },
        },
        errorMessage: null,
        createdAt: '2026-03-09T00:00:00.000Z',
        updatedAt: '2026-03-09T00:01:00.000Z',
      },
    })

    expect(item.stage).toBe('story-to-script')
    expect(item.statusBucket).toBe('success')
    expect(item.options).toEqual({
      enabled: true,
      preset: 'action-battle',
      layout: 'cinematic',
      colorMode: 'black-white',
      style: 'manga ink',
    })
    expect(item.preview.inputSnippet?.endsWith('…')).toBe(true)
    expect(item.preview.outputSnippet).toBe('done')
  })

  it('falls back to defaults and failed bucket when metadata is missing', () => {
    const item = mapQuickMangaHistoryItem({
      run: {
        id: 'run-2',
        workflowType: 'script_to_storyboard_run',
        taskId: null,
        episodeId: 'episode-2',
        status: RUN_STATUS.FAILED,
        input: {},
        output: {},
        errorMessage: 'boom',
        createdAt: '2026-03-09T00:00:00.000Z',
        updatedAt: '2026-03-09T00:01:00.000Z',
      },
    })

    expect(item.stage).toBe('script-to-storyboard')
    expect(item.statusBucket).toBe('failed')
    expect(item.options).toEqual({
      enabled: false,
      preset: 'auto',
      layout: 'auto',
      colorMode: 'auto',
      style: null,
    })
    expect(item.errorMessage).toBe('boom')
  })

  it('maps filter to run statuses', () => {
    expect(parseQuickMangaHistoryStatusFilter('success')).toBe('success')
    expect(parseQuickMangaHistoryStatusFilter('invalid')).toBe('all')
    expect(toRunStatuses('all')).toEqual([
      RUN_STATUS.COMPLETED,
      RUN_STATUS.FAILED,
      RUN_STATUS.CANCELING,
      RUN_STATUS.CANCELED,
    ])
    expect(toRunStatuses('success')).toEqual([RUN_STATUS.COMPLETED])
    expect(toRunStatuses('failed')).toEqual([RUN_STATUS.FAILED])
    expect(toRunStatuses('cancelled')).toEqual([RUN_STATUS.CANCELING, RUN_STATUS.CANCELED])
  })
})
