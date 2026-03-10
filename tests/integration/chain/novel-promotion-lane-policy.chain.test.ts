import type { Job } from 'bullmq'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TASK_TYPE, type TaskJobData } from '@/lib/task/types'

const queueState = vi.hoisted(() => ({
  addCallsByQueue: new Map<string, Array<{ data: TaskJobData }>>(),
}))

const orchestratorStoryState = vi.hoisted(() => ({
  lastInput: null as Record<string, unknown> | null,
}))

const orchestratorStoryboardState = vi.hoisted(() => ({
  lastInput: null as Record<string, unknown> | null,
}))

const prismaStoryMock = vi.hoisted(() => ({
  project: { findUnique: vi.fn(async () => ({ id: 'project-1', name: 'P1', mode: 'novel-promotion' })) },
  novelPromotionProject: {
    findUnique: vi.fn(async () => ({
      id: 'np-project-1',
      analysisModel: 'llm::analysis-1',
      characters: [],
      locations: [],
    })),
  },
  novelPromotionEpisode: {
    findUnique: vi.fn(async ({ where }: { where: { id: string } }) => (
      where.id === 'episode-1'
        ? { id: 'episode-1', novelPromotionProjectId: 'np-project-1', novelText: 'episode content', clips: [] }
        : null
    )),
  },
  novelPromotionClip: { update: vi.fn(async () => ({})) },
  novelPromotionVoiceLine: {
    deleteMany: vi.fn(async () => undefined),
    create: vi.fn(async () => ({ id: 'voice-1' })),
  },
  $transaction: vi.fn(async (fn: (tx: {
    novelPromotionVoiceLine: {
      deleteMany: (args: { where: { episodeId: string } }) => Promise<unknown>
      create: (args: { data: Record<string, unknown>; select: { id: boolean } }) => Promise<{ id: string }>
    }
  }) => Promise<unknown>) => {
    const tx = {
      novelPromotionVoiceLine: {
        deleteMany: async () => undefined,
        create: async () => ({ id: 'voice-1' }),
      },
    }
    return await fn(tx)
  }),
}))

const workerMock = vi.hoisted(() => ({
  reportTaskProgress: vi.fn(async () => undefined),
  assertTaskActive: vi.fn(async () => undefined),
}))

vi.mock('bullmq', () => ({
  Queue: class {
    private readonly queueName: string

    constructor(queueName: string) {
      this.queueName = queueName
    }

    async add(_jobName: string, data: TaskJobData) {
      const list = queueState.addCallsByQueue.get(this.queueName) || []
      list.push({ data })
      queueState.addCallsByQueue.set(this.queueName, list)
      return { id: data.taskId }
    }

    async getJob() {
      return null
    }
  },
}))

vi.mock('@/lib/redis', () => ({ queueRedis: {} }))
vi.mock('@/lib/prisma', () => ({ prisma: prismaStoryMock }))
vi.mock('@/lib/config-service', () => ({
  resolveProjectModelCapabilityGenerationOptions: vi.fn(async () => ({ reasoningEffort: 'high' })),
}))
vi.mock('@/lib/ai-runtime', () => ({
  executeAiTextStep: vi.fn(async () => ({
    text: JSON.stringify([
      {
        lineIndex: 1,
        speaker: 'Narrator',
        content: 'line',
        emotionStrength: 0.8,
        matchedPanel: { storyboardId: 'storyboard-1', panelIndex: 1 },
      },
    ]),
    reasoning: '',
  })),
}))
vi.mock('@/lib/workers/shared', () => ({ reportTaskProgress: workerMock.reportTaskProgress }))
vi.mock('@/lib/workers/utils', () => ({ assertTaskActive: workerMock.assertTaskActive }))
vi.mock('@/lib/logging/semantic', () => ({ logAIAnalysis: vi.fn() }))
vi.mock('@/lib/logging/file-writer', () => ({ onProjectNameAvailable: vi.fn() }))
vi.mock('@/lib/prompt-i18n', () => ({
  PROMPT_IDS: {
    NP_AGENT_CHARACTER_PROFILE: 'a',
    NP_SELECT_LOCATION: 'b',
    NP_AGENT_CLIP: 'c',
    NP_SCREENPLAY_CONVERSION: 'd',
    NP_AGENT_STORYBOARD_PLAN: 'plan',
    NP_AGENT_CINEMATOGRAPHER: 'cin',
    NP_AGENT_ACTING_DIRECTION: 'act',
    NP_AGENT_STORYBOARD_DETAIL: 'detail',
    NP_VOICE_ANALYSIS: 'voice',
  },
  getPromptTemplate: vi.fn(() => 'prompt-template'),
  buildPrompt: vi.fn(() => 'voice prompt'),
}))
vi.mock('@/lib/llm-observe/internal-stream-context', () => ({
  withInternalLLMStreamCallbacks: vi.fn(async (_callbacks: unknown, fn: () => Promise<unknown>) => await fn()),
}))
vi.mock('@/lib/workers/handlers/llm-stream', () => ({
  createWorkerLLMStreamContext: vi.fn(() => ({ streamRunId: 'run-1', nextSeqByStepLane: {} })),
  createWorkerLLMStreamCallbacks: vi.fn(() => ({
    onStage: vi.fn(),
    onChunk: vi.fn(),
    onComplete: vi.fn(),
    onError: vi.fn(),
    flush: vi.fn(async () => undefined),
  })),
}))
vi.mock('@/lib/workers/handlers/story-to-script-helpers', () => ({
  asString: (value: unknown) => (typeof value === 'string' ? value : ''),
  parseEffort: vi.fn(() => null),
  parseTemperature: vi.fn((value: unknown) => (typeof value === 'number' ? value : 0.7)),
  persistAnalyzedCharacters: vi.fn(async () => []),
  persistAnalyzedLocations: vi.fn(async () => []),
  persistClips: vi.fn(async () => [{ id: 'clip-row-1', clipKey: 'clip_1' }]),
  resolveClipRecordId: (clipIdMap: Map<string, string>, clipId: string) => clipIdMap.get(clipId) ?? null,
}))
vi.mock('@/lib/workers/handlers/script-to-storyboard-helpers', () => ({
  asJsonRecord: (value: unknown) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null
    return value as Record<string, unknown>
  },
  buildStoryboardJson: vi.fn(() => '[]'),
  parseEffort: vi.fn(() => null),
  parseTemperature: vi.fn((value: unknown) => (typeof value === 'number' ? value : 0.7)),
  parseVoiceLinesJson: vi.fn(() => [
    {
      lineIndex: 1,
      speaker: 'Narrator',
      content: 'line',
      emotionStrength: 0.8,
      matchedPanel: { storyboardId: 'storyboard-1', panelIndex: 1 },
    },
  ]),
  persistStoryboardsAndPanels: vi.fn(async () => [
    {
      storyboardId: 'storyboard-1',
      panels: [{ id: 'panel-1', panelIndex: 1 }],
    },
  ]),
  toPositiveInt: (value: unknown) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null
    const n = Math.floor(value)
    return n > 0 ? n : null
  },
}))
vi.mock('@/lib/workers/handlers/resolve-analysis-model', () => ({
  resolveAnalysisModel: vi.fn(async () => 'llm::analysis-1'),
}))

vi.mock('@/lib/novel-promotion/story-to-script/orchestrator', () => ({
  runStoryToScriptOrchestrator: vi.fn(async (input: Record<string, unknown>) => {
    orchestratorStoryState.lastInput = input
    return {
      analyzedCharacters: [],
      analyzedLocations: [],
      clipList: [
        {
          id: 'clip_1',
          startText: 'start',
          endText: 'end',
          summary: 'summary',
          location: null,
          characters: [],
          content: 'clip content',
          matchLevel: 'L1',
          matchConfidence: 1,
        },
      ],
      screenplayResults: [
        {
          clipId: 'clip_1',
          success: true,
          sceneCount: 1,
          screenplay: { scenes: [{ scene: 1 }] },
        },
      ],
      summary: {
        characterCount: 0,
        locationCount: 0,
        clipCount: 1,
        screenplaySuccessCount: 1,
        screenplayFailedCount: 0,
        totalScenes: 1,
      },
      characterStep: { text: '{}', reasoning: '' },
      locationStep: { text: '{}', reasoning: '' },
      splitStep: { text: '[]', reasoning: '' },
      charactersObject: {},
      locationsObject: {},
      charactersLibName: '',
      locationsLibName: '',
      charactersIntroduction: '',
    }
  }),
}))

vi.mock('@/lib/novel-promotion/script-to-storyboard/orchestrator', () => ({
  JsonParseError: class JsonParseError extends Error {
    rawText: string

    constructor(message: string, rawText: string) {
      super(message)
      this.name = 'JsonParseError'
      this.rawText = rawText
    }
  },
  runScriptToStoryboardOrchestrator: vi.fn(async (input: Record<string, unknown>) => {
    orchestratorStoryboardState.lastInput = input
    return {
      clipPanels: [
        {
          clipId: 'clip-1',
          clipIndex: 1,
          finalPanels: [
            {
              panel_number: 1,
              description: 'panel',
              location: 'loc',
              characters: ['Narrator'],
            },
          ],
        },
      ],
      summary: {
        clipCount: 1,
        totalPanelCount: 1,
        totalStepCount: 4,
      },
    }
  }),
}))
vi.mock('@/lib/run-runtime/graph-executor', () => ({
  executePipelineGraph: vi.fn(async (input: {
    runId: string
    projectId: string
    userId: string
    state: Record<string, unknown>
    nodes: Array<{ key: string; run: (ctx: Record<string, unknown>) => Promise<unknown> }>
  }) => {
    for (const node of input.nodes) {
      await node.run({
        runId: input.runId,
        projectId: input.projectId,
        userId: input.userId,
        nodeKey: node.key,
        attempt: 1,
        state: input.state,
      })
    }
    return input.state
  }),
}))

function toJob(data: TaskJobData): Job<TaskJobData> {
  return { data } as unknown as Job<TaskJobData>
}

describe('chain contract - lane metadata propagates API -> queue -> worker/orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queueState.addCallsByQueue.clear()
    orchestratorStoryState.lastInput = null
    orchestratorStoryboardState.lastInput = null
  })

  it('story_to_script run propagates lane metadata and applies manga prompt directive', async () => {
    const { addTaskJob, QUEUE_NAME } = await import('@/lib/task/queues')
    const { handleStoryToScriptTask } = await import('@/lib/workers/handlers/story-to-script')

    await addTaskJob({
      taskId: 'task-story-chain-1',
      type: TASK_TYPE.STORY_TO_SCRIPT_RUN,
      locale: 'vi',
      projectId: 'project-1',
      episodeId: 'episode-1',
      targetType: 'NovelPromotionEpisode',
      targetId: 'episode-1',
      payload: {
        episodeId: 'episode-1',
        content: 'source content',
        runId: 'run-story-1',
        runtimeLane: 'manga_webtoon',
        stageProfile: 'story_to_script',
        entryIntent: 'manga_quickstart',
        sourceType: 'blank',
      },
      userId: 'user-1',
    })

    const calls = queueState.addCallsByQueue.get(QUEUE_NAME.TEXT) || []
    const queued = calls[0]?.data
    expect(queued?.payload).toEqual(expect.objectContaining({
      runtimeLane: 'manga_webtoon',
      stageProfile: 'story_to_script',
      entryIntent: 'manga_quickstart',
      sourceType: 'blank',
    }))

    const result = await handleStoryToScriptTask(toJob(queued!))
    expect(result).toEqual(expect.objectContaining({
      lanePolicy: expect.objectContaining({
        runtimeLane: 'manga_webtoon',
        entryIntent: 'manga_quickstart',
        sourceType: 'blank',
      }),
    }))

    expect(orchestratorStoryState.lastInput?.promptDirective).toEqual(expect.stringContaining('Lane=manga_webtoon'))
  })

  it('script_to_storyboard run propagates lane metadata and applies film prompt directive', async () => {
    prismaStoryMock.novelPromotionEpisode.findUnique.mockResolvedValueOnce({
      id: 'episode-1',
      novelPromotionProjectId: 'np-project-1',
      novelText: 'episode text',
      clips: [
        {
          id: 'clip-1',
          content: 'clip content',
          characters: JSON.stringify(['Narrator']),
          location: 'Office',
          screenplay: JSON.stringify({ scenes: [{ id: 1 }] }),
        },
      ],
    })

    const { addTaskJob, QUEUE_NAME } = await import('@/lib/task/queues')
    const { handleScriptToStoryboardTask } = await import('@/lib/workers/handlers/script-to-storyboard')

    await addTaskJob({
      taskId: 'task-storyboard-chain-1',
      type: TASK_TYPE.SCRIPT_TO_STORYBOARD_RUN,
      locale: 'vi',
      projectId: 'project-1',
      episodeId: 'episode-1',
      targetType: 'NovelPromotionEpisode',
      targetId: 'episode-1',
      payload: {
        episodeId: 'episode-1',
        runId: 'run-storyboard-1',
        runtimeLane: 'film_video',
        stageProfile: 'script_to_storyboard',
        entryIntent: 'video_ad_short',
        sourceType: 'story_text',
      },
      userId: 'user-1',
    })

    const calls = queueState.addCallsByQueue.get(QUEUE_NAME.TEXT) || []
    const queued = calls[0]?.data
    expect(queued?.payload).toEqual(expect.objectContaining({
      runtimeLane: 'film_video',
      stageProfile: 'script_to_storyboard',
      entryIntent: 'video_ad_short',
      sourceType: 'story_text',
    }))

    const result = await handleScriptToStoryboardTask(toJob(queued!))
    expect(result).toEqual(expect.objectContaining({
      lanePolicy: expect.objectContaining({
        runtimeLane: 'film_video',
        entryIntent: 'video_ad_short',
        sourceType: 'story_text',
      }),
    }))

    expect(orchestratorStoryboardState.lastInput?.promptDirective).toEqual(expect.stringContaining('Lane=film_video'))
  })
})
