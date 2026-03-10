import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildMockRequest } from '../../../helpers/request'

const authState = vi.hoisted(() => ({ authenticated: true }))
const maybeSubmitLLMTaskMock = vi.hoisted(() => vi.fn())

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
      }
    },
  }
})

vi.mock('@/lib/llm-observe/route-task', () => ({
  maybeSubmitLLMTask: maybeSubmitLLMTaskMock,
}))

describe('api contract - novel-promotion stream routes preserve lane metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.authenticated = true
    maybeSubmitLLMTaskMock.mockResolvedValue(new Response(JSON.stringify({ success: true, runId: 'run-1' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }))
  })

  it('story-to-script stream forwards runtimeLane + entryIntent + sourceType to queue payload', async () => {
    const { POST } = await import('@/app/api/novel-promotion/[projectId]/story-to-script-stream/route')
    const req = buildMockRequest({
      path: '/api/novel-promotion/project-1/story-to-script-stream',
      method: 'POST',
      body: {
        episodeId: 'episode-1',
        content: 'source text',
        runtimeLane: 'manga_webtoon',
        stageProfile: 'story_to_script',
        entryIntent: 'manga_story_to_panels',
        sourceType: 'import_script',
      },
    })

    const res = await POST(req, { params: Promise.resolve({ projectId: 'project-1' }) })
    expect(res.status).toBe(200)

    expect(maybeSubmitLLMTaskMock).toHaveBeenCalledWith(expect.objectContaining({
      type: 'story_to_script_run',
      body: expect.objectContaining({
        runtimeLane: 'manga_webtoon',
        stageProfile: 'story_to_script',
        entryIntent: 'manga_story_to_panels',
        sourceType: 'import_script',
      }),
    }))
  })

  it('script-to-storyboard stream forwards runtimeLane + entryIntent + sourceType to queue payload', async () => {
    const { POST } = await import('@/app/api/novel-promotion/[projectId]/script-to-storyboard-stream/route')
    const req = buildMockRequest({
      path: '/api/novel-promotion/project-1/script-to-storyboard-stream',
      method: 'POST',
      body: {
        episodeId: 'episode-1',
        runtimeLane: 'film_video',
        stageProfile: 'script_to_storyboard',
        entryIntent: 'video_ad_short',
        sourceType: 'story_text',
      },
    })

    const res = await POST(req, { params: Promise.resolve({ projectId: 'project-1' }) })
    expect(res.status).toBe(200)

    expect(maybeSubmitLLMTaskMock).toHaveBeenCalledWith(expect.objectContaining({
      type: 'script_to_storyboard_run',
      body: expect.objectContaining({
        runtimeLane: 'film_video',
        stageProfile: 'script_to_storyboard',
        entryIntent: 'video_ad_short',
        sourceType: 'story_text',
      }),
    }))
  })
})
