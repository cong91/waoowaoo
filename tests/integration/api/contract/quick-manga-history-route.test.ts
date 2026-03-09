import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildMockRequest } from '../../../helpers/request'

const authState = vi.hoisted(() => ({
  authenticated: true,
}))

const listRunsMock = vi.hoisted(() => vi.fn())
const getTasksByIdsMock = vi.hoisted(() => vi.fn())
const listTaskLifecycleEventsMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api-auth', () => {
  const unauthorized = () => new Response(
    JSON.stringify({ error: { code: 'UNAUTHORIZED' } }),
    { status: 401, headers: { 'content-type': 'application/json' } },
  )

  return {
    isErrorResponse: (value: unknown) => value instanceof Response,
    requireProjectAuth: async (projectId: string) => {
      if (!authState.authenticated) return unauthorized()
      return {
        session: { user: { id: 'user-1' } },
        project: { id: projectId, userId: 'user-1', mode: 'novel-promotion' },
        novelData: { id: 'np-1' },
      }
    },
  }
})

vi.mock('@/lib/run-runtime/service', () => ({
  listRuns: listRunsMock,
}))

vi.mock('@/lib/task/service', () => ({
  getTasksByIds: getTasksByIdsMock,
}))

vi.mock('@/lib/task/publisher', () => ({
  listTaskLifecycleEvents: listTaskLifecycleEventsMock,
}))

describe('api contract - quick manga history route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.authenticated = true

    listRunsMock
      .mockResolvedValueOnce([
        {
          id: 'run-story',
          taskId: 'task-story',
          episodeId: 'episode-1',
          workflowType: 'story_to_script_run',
          status: 'completed',
          input: {
            quickManga: {
              enabled: true,
              preset: 'action-battle',
              layout: 'cinematic',
              colorMode: 'black-white',
              style: 'manga ink',
            },
            quickMangaStage: 'story-to-script',
            content: 'story content',
          },
          output: {
            summary: {
              text: 'story done',
            },
          },
          errorMessage: null,
          createdAt: '2026-03-09T00:00:00.000Z',
          updatedAt: '2026-03-09T00:02:00.000Z',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'run-script',
          taskId: 'task-script',
          episodeId: 'episode-1',
          workflowType: 'script_to_storyboard_run',
          status: 'failed',
          input: {
            quickManga: {
              enabled: true,
              preset: 'slice-of-life',
              layout: 'vertical-scroll',
              colorMode: 'full-color',
              style: null,
            },
            quickMangaStage: 'script-to-storyboard',
          },
          output: {},
          errorMessage: 'boom',
          createdAt: '2026-03-09T00:01:00.000Z',
          updatedAt: '2026-03-09T00:03:00.000Z',
        },
      ])

    getTasksByIdsMock.mockResolvedValue([
      {
        id: 'task-story',
        userId: 'user-1',
        projectId: 'project-1',
        payload: { quickManga: { enabled: true } },
        updatedAt: new Date('2026-03-09T00:02:00.000Z'),
        status: 'completed',
        errorCode: null,
      },
      {
        id: 'task-script',
        userId: 'user-1',
        projectId: 'project-1',
        payload: { quickManga: { enabled: true } },
        updatedAt: new Date('2026-03-09T00:03:00.000Z'),
        status: 'failed',
        errorCode: 'INTERNAL_ERROR',
      },
    ])

    listTaskLifecycleEventsMock
      .mockResolvedValueOnce([
        {
          type: 'task.lifecycle',
          ts: '2026-03-09T00:02:00.000Z',
          payload: { lifecycleType: 'task.completed' },
        },
      ])
      .mockResolvedValueOnce([
        {
          type: 'task.lifecycle',
          ts: '2026-03-09T00:03:00.000Z',
          payload: { lifecycleType: 'task.failed' },
        },
      ])
  })

  it('returns unauthorized when missing auth', async () => {
    authState.authenticated = false
    const { GET } = await import('@/app/api/novel-promotion/[projectId]/quick-manga/history/route')
    const req = buildMockRequest({
      path: '/api/novel-promotion/project-1/quick-manga/history',
      method: 'GET',
    })
    const res = await GET(req, { params: Promise.resolve({ projectId: 'project-1' }) })
    expect(res.status).toBe(401)
  })

  it('returns quick manga history list with lifecycle metadata', async () => {
    const { GET } = await import('@/app/api/novel-promotion/[projectId]/quick-manga/history/route')
    const req = buildMockRequest({
      path: '/api/novel-promotion/project-1/quick-manga/history',
      method: 'GET',
      query: {
        status: 'all',
        limit: 20,
      },
    })

    const res = await GET(req, { params: Promise.resolve({ projectId: 'project-1' }) })
    expect(res.status).toBe(200)

    const payload = await res.json() as {
      history: Array<{
        runId: string
        statusBucket: string
        latestEventType: string | null
      }>
      filter: {
        status: string
        limit: number
      }
    }

    expect(payload.filter).toEqual({ status: 'all', limit: 20 })
    expect(payload.history).toHaveLength(2)
    expect(payload.history[0]?.runId).toBe('run-script')
    expect(payload.history[0]?.statusBucket).toBe('failed')
    expect(payload.history[0]?.latestEventType).toBe('task.failed')
    expect(payload.history[1]?.runId).toBe('run-story')
    expect(payload.history[1]?.statusBucket).toBe('success')
    expect(payload.history[1]?.latestEventType).toBe('task.completed')

    expect(listRunsMock).toHaveBeenCalledTimes(2)
    expect(getTasksByIdsMock).toHaveBeenCalledWith(['task-script', 'task-story'])
  })
})
