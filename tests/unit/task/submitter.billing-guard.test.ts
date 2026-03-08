import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TaskBillingInfo } from '@/lib/task/types'
import { TASK_TYPE } from '@/lib/task/types'

const createTaskMock = vi.hoisted(() => vi.fn())
const markTaskFailedMock = vi.hoisted(() => vi.fn(async () => undefined))
const markTaskEnqueuedMock = vi.hoisted(() => vi.fn(async () => undefined))
const markTaskEnqueueFailedMock = vi.hoisted(() => vi.fn(async () => undefined))
const rollbackTaskBillingForTaskMock = vi.hoisted(() => vi.fn(async () => ({ attempted: false, rolledBack: false })))
const updateTaskBillingInfoMock = vi.hoisted(() => vi.fn(async () => undefined))
const updateTaskPayloadMock = vi.hoisted(() => vi.fn(async () => undefined))

const addTaskJobMock = vi.hoisted(() => vi.fn(async () => ({ id: 'job-1' })))
const publishTaskEventMock = vi.hoisted(() => vi.fn(async () => undefined))

const createRunMock = vi.hoisted(() => vi.fn(async () => ({ id: 'run-1' })))
const attachTaskToRunMock = vi.hoisted(() => vi.fn(async () => undefined))

const buildDefaultTaskBillingInfoMock = vi.hoisted(() => vi.fn())
const isBillableTaskTypeMock = vi.hoisted(() => vi.fn(() => true))
const prepareTaskBillingMock = vi.hoisted(() => vi.fn(async ({ billingInfo }: { billingInfo: TaskBillingInfo }) => billingInfo))
const getBillingModeMock = vi.hoisted(() => vi.fn(async () => 'ENFORCE'))

vi.mock('@/lib/logging/core', () => ({
  createScopedLogger: () => ({ info: vi.fn(), error: vi.fn() }),
}))

vi.mock('@/lib/task/service', () => ({
  createTask: createTaskMock,
  markTaskEnqueueFailed: markTaskEnqueueFailedMock,
  markTaskEnqueued: markTaskEnqueuedMock,
  markTaskFailed: markTaskFailedMock,
  rollbackTaskBillingForTask: rollbackTaskBillingForTaskMock,
  updateTaskBillingInfo: updateTaskBillingInfoMock,
  updateTaskPayload: updateTaskPayloadMock,
}))

vi.mock('@/lib/task/queues', () => ({
  addTaskJob: addTaskJobMock,
}))

vi.mock('@/lib/task/publisher', () => ({
  publishTaskEvent: publishTaskEventMock,
}))

vi.mock('@/lib/run-runtime/service', () => ({
  createRun: createRunMock,
  attachTaskToRun: attachTaskToRunMock,
}))

vi.mock('@/lib/run-runtime/workflow', () => ({
  isAiTaskType: () => true,
  workflowTypeFromTaskType: () => 'story_to_script_run',
}))

vi.mock('@/lib/billing', () => ({
  buildDefaultTaskBillingInfo: buildDefaultTaskBillingInfoMock,
  getBillingMode: getBillingModeMock,
  isBillableTaskType: isBillableTaskTypeMock,
  prepareTaskBilling: prepareTaskBillingMock,
  InsufficientBalanceError: class extends Error {
    required = 0
    available = 0
  },
}))

import { submitTask } from '@/lib/task/submitter'

describe('task submitter billing guard', () => {
  const providedBillingInfo: TaskBillingInfo = {
    billable: true,
    source: 'task',
    taskType: TASK_TYPE.STORY_TO_SCRIPT_RUN,
    apiType: 'text',
    model: 'anthropic/claude-sonnet-4',
    quantity: 2000,
    unit: 'token',
    maxFrozenCost: 0.05,
    action: TASK_TYPE.STORY_TO_SCRIPT_RUN,
    status: 'quoted',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    buildDefaultTaskBillingInfoMock.mockReturnValue(null)
    createTaskMock.mockResolvedValue({
      task: {
        id: 'task-1',
        status: 'queued',
        priority: 0,
        payload: {},
        billingInfo: null,
      },
      deduped: false,
    })
  })

  it('accepts route-provided billingInfo when computed billing is null for billable task', async () => {
    const result = await submitTask({
      userId: 'user-1',
      locale: 'en',
      projectId: 'project-1',
      episodeId: 'episode-1',
      type: TASK_TYPE.STORY_TO_SCRIPT_RUN,
      targetType: 'Episode',
      targetId: 'episode-1',
      payload: { story: 'test' },
      billingInfo: providedBillingInfo,
    })

    expect(result.success).toBe(true)
    expect(markTaskFailedMock).not.toHaveBeenCalled()
    expect(prepareTaskBillingMock).toHaveBeenCalledWith(expect.objectContaining({
      id: 'task-1',
      billingInfo: providedBillingInfo,
    }))
    expect(addTaskJobMock).toHaveBeenCalledWith(
      expect.objectContaining({
        billingInfo: providedBillingInfo,
      }),
      expect.any(Object),
    )
  })

  it('still fails billable task when both computed and provided billingInfo are missing', async () => {
    await expect(
      submitTask({
        userId: 'user-1',
        locale: 'en',
        projectId: 'project-1',
        type: TASK_TYPE.STORY_TO_SCRIPT_RUN,
        targetType: 'Episode',
        targetId: 'episode-1',
        payload: { story: 'test' },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_PARAMS' })

    expect(markTaskFailedMock).toHaveBeenCalledWith(
      'task-1',
      'INVALID_PARAMS',
      expect.stringContaining('missing server-generated billingInfo for billable task type'),
    )
  })
})
