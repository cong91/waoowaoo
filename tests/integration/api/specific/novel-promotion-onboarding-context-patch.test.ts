import { beforeEach, describe, expect, it, vi } from 'vitest'
import { callRoute } from '../../../helpers/request'

type AuthState = { authenticated: boolean }

const authState = vi.hoisted<AuthState>(() => ({ authenticated: true }))
const logProjectActionMock = vi.hoisted(() => vi.fn())
const attachMediaFieldsToProjectMock = vi.hoisted(() => vi.fn((value: unknown) => value))

const prismaMock = vi.hoisted(() => ({
  novelPromotionProject: {
    findUnique: vi.fn(async () => ({
      analysisModel: 'llm::analysis',
      characterModel: 'img::character',
      locationModel: 'img::location',
      storyboardModel: 'img::storyboard',
      editModel: 'img::edit',
      videoModel: 'vid::model',
      capabilityOverrides: JSON.stringify({
        __workspaceOnboardingContext: {
          journeyType: 'manga_webtoon',
          entryIntent: 'manga_story_to_panels',
          sourceType: 'story_text',
          sourceContent: 'Opening story',
          stylePresetId: 'manga-action-battle',
          characterStrategyId: 'consistency-first',
          environmentPresetId: 'city-night-neon',
          promptMode: 'guided',
          referenceBoardSelections: ['character-sheet'],
          capturedAt: '2026-03-17T06:00:00.000Z',
        },
      }),
    })),
    update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
      id: 'np-1',
      projectId: 'project-1',
      ...data,
    })),
  },
}))

vi.mock('@/lib/api-auth', () => {
  const forbidden = () => new Response(JSON.stringify({ error: { code: 'FORBIDDEN' } }), {
    status: 403,
    headers: { 'content-type': 'application/json' },
  })

  return {
    isErrorResponse: (value: unknown) => value instanceof Response,
    requireProjectAuthLight: async () => {
      if (!authState.authenticated) return forbidden()
      return {
        session: { user: { id: 'user-1', name: 'Tester' } },
        project: {
          id: 'project-1',
          name: 'VAT Visual First',
          mode: 'novel-promotion',
          userId: 'user-1',
        },
      }
    },
  }
})

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/logging/semantic', () => ({ logProjectAction: logProjectActionMock }))
vi.mock('@/lib/media/attach', () => ({ attachMediaFieldsToProject: attachMediaFieldsToProjectMock }))

describe('api specific - /api/novel-promotion/[projectId] PATCH onboarding context merge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.authenticated = true
  })

  it('merges onboardingContext updates without dropping existing visual-first fields', async () => {
    const { PATCH } = await import('@/app/api/novel-promotion/[projectId]/route')

    const res = await callRoute(PATCH, {
      path: '/api/novel-promotion/project-1',
      method: 'PATCH',
      body: {
        onboardingContext: {
          promptMode: 'advanced',
          referenceBoardSelections: ['mood-lighting', 'environment-anchor'],
        },
      },
      context: { params: Promise.resolve({ projectId: 'project-1' }) },
    })

    expect(res.status).toBe(200)

    const updateArg = prismaMock.novelPromotionProject.update.mock.calls[0]?.[0]
    expect(updateArg).toBeTruthy()
    const parsed = JSON.parse(String(updateArg.data.capabilityOverrides || '{}'))

    expect(parsed.__workspaceOnboardingContext).toMatchObject({
      journeyType: 'manga_webtoon',
      entryIntent: 'manga_story_to_panels',
      sourceType: 'story_text',
      sourceContent: 'Opening story',
      stylePresetId: 'manga-action-battle',
      characterStrategyId: 'consistency-first',
      environmentPresetId: 'city-night-neon',
      promptMode: 'advanced',
      referenceBoardSelections: ['mood-lighting', 'environment-anchor'],
    })
  })
})
