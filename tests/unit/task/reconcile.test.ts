import { beforeEach, describe, expect, it, vi } from 'vitest'

const taskFindManyMock = vi.hoisted(() => vi.fn())
const taskUpdateManyMock = vi.hoisted(() => vi.fn())
const graphRunFindManyMock = vi.hoisted(() => vi.fn())
const publishTaskEventMock = vi.hoisted(() => vi.fn(async () => undefined))
const publishRunEventMock = vi.hoisted(() => vi.fn(async () => undefined))
const rollbackTaskBillingForTaskMock = vi.hoisted(() =>
  vi.fn(async () => ({ attempted: false, rolledBack: true, billingInfo: null })),
)

function createQueueMock() {
  return {
    getJob: vi.fn(async () => null),
  }
}

const imageQueueMock = vi.hoisted(() => createQueueMock())
const videoQueueMock = vi.hoisted(() => createQueueMock())
const voiceQueueMock = vi.hoisted(() => createQueueMock())
const textQueueMock = vi.hoisted(() => createQueueMock())

vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: taskFindManyMock,
      updateMany: taskUpdateManyMock,
    },
    graphRun: {
      findMany: graphRunFindManyMock,
    },
  },
}))

vi.mock('@/lib/logging/core', () => ({
  createScopedLogger: () => ({ info: vi.fn(), error: vi.fn() }),
}))

vi.mock('@/lib/task/publisher', () => ({
  publishTaskEvent: publishTaskEventMock,
}))

vi.mock('@/lib/task/service', () => ({
  rollbackTaskBillingForTask: rollbackTaskBillingForTaskMock,
}))

vi.mock('@/lib/run-runtime/publisher', () => ({
  publishRunEvent: publishRunEventMock,
}))

vi.mock('@/lib/task/queues', () => ({
  imageQueue: imageQueueMock,
  videoQueue: videoQueueMock,
  voiceQueue: voiceQueueMock,
  textQueue: textQueueMock,
}))

import { reconcileActiveTasks } from '@/lib/task/reconcile'

describe('task reconcile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    imageQueueMock.getJob.mockResolvedValue(null)
    videoQueueMock.getJob.mockResolvedValue(null)
    voiceQueueMock.getJob.mockResolvedValue(null)
    textQueueMock.getJob.mockResolvedValue(null)
  })

  it('propagates orphaned task failure to linked running graph runs', async () => {
    taskFindManyMock.mockResolvedValueOnce([
      {
        id: 'task-1',
        userId: 'user-1',
        projectId: 'project-1',
        episodeId: 'episode-1',
        type: 'story_to_script_run',
        targetType: 'NovelPromotionEpisode',
        targetId: 'episode-1',
        billingInfo: null,
        updatedAt: new Date(Date.now() - 10 * 60_000),
      },
    ])
    taskUpdateManyMock.mockResolvedValueOnce({ count: 1 })
    graphRunFindManyMock.mockResolvedValueOnce([
      { id: 'run-1', projectId: 'project-1', userId: 'user-1' },
    ])

    const reconciled = await reconcileActiveTasks()

    expect(reconciled).toEqual(['task-1'])
    expect(publishTaskEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 'task-1',
        type: 'task.failed',
      }),
    )
    expect(publishRunEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: 'run-1',
        eventType: 'run.error',
        payload: expect.objectContaining({
          taskId: 'task-1',
          errorCode: 'RECONCILE_ORPHAN',
        }),
      }),
    )
  })
})
