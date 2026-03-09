import { NextRequest, NextResponse } from 'next/server'
import { isErrorResponse, requireProjectAuth } from '@/lib/api-auth'
import { apiHandler } from '@/lib/api-errors'
import { listRuns } from '@/lib/run-runtime/service'
import { getTasksByIds } from '@/lib/task/service'
import { listTaskLifecycleEvents } from '@/lib/task/publisher'
import {
  isQuickMangaRun,
  mapQuickMangaHistoryItem,
  parseQuickMangaHistoryStatusFilter,
  toRunStatuses,
  type QuickMangaHistoryRun,
  type QuickMangaHistoryTaskSnapshot,
} from '@/lib/novel-promotion/quick-manga-history'

const QUICK_MANGA_WORKFLOWS = [
  'story_to_script_run',
  'script_to_storyboard_run',
] as const

function toObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function toTaskSnapshot(params: {
  payload?: unknown
  fallbackUpdatedAt: Date
  fallbackStatus: string
  fallbackErrorCode?: string | null
  latestEventType?: string | null
  latestEventAt?: string | null
}): QuickMangaHistoryTaskSnapshot {
  return {
    payload: toObject(params.payload),
    latestEventType: params.latestEventType || params.fallbackErrorCode || params.fallbackStatus || null,
    latestEventAt: params.latestEventAt || params.fallbackUpdatedAt.toISOString(),
  }
}

export const GET = apiHandler(async (
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> },
) => {
  const { projectId } = await context.params

  const authResult = await requireProjectAuth(projectId)
  if (isErrorResponse(authResult)) return authResult
  const { session } = authResult

  const search = request.nextUrl.searchParams
  const statusFilter = parseQuickMangaHistoryStatusFilter(search.get('status'))
  const runStatuses = toRunStatuses(statusFilter)

  const rawLimit = Number.parseInt(search.get('limit') || '20', 10)
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 20)
    : 20

  const runResults = await Promise.all(
    QUICK_MANGA_WORKFLOWS.map((workflowType) => listRuns({
      userId: session.user.id,
      projectId,
      workflowType,
      statuses: runStatuses,
      limit: 80,
    })),
  )

  const mergedRuns = runResults
    .flat()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const taskIds = Array.from(new Set(
    mergedRuns
      .map((run) => (typeof run.taskId === 'string' && run.taskId ? run.taskId : null))
      .filter((value): value is string => Boolean(value)),
  ))

  const taskMap = new Map<string, QuickMangaHistoryTaskSnapshot>()
  const tasks = await getTasksByIds(taskIds)
  for (const task of tasks) {
    if (task.userId !== session.user.id || task.projectId !== projectId) continue

    const lifecycleEvents = await listTaskLifecycleEvents(task.id, 200)
    const latestLifecycleEvent = lifecycleEvents[lifecycleEvents.length - 1]

    taskMap.set(task.id, toTaskSnapshot({
      payload: task.payload,
      fallbackUpdatedAt: task.updatedAt,
      fallbackStatus: task.status,
      fallbackErrorCode: task.errorCode,
      latestEventType: latestLifecycleEvent?.payload?.lifecycleType || latestLifecycleEvent?.type || null,
      latestEventAt: latestLifecycleEvent?.ts || null,
    }))
  }

  const history = mergedRuns
    .filter((run) => {
      const runInput = toObject(run.input)
      const taskPayload = toObject(taskMap.get(run.taskId || '')?.payload)
      return isQuickMangaRun({ runInput, taskPayload })
    })
    .map((run) => mapQuickMangaHistoryItem({
      run: run as QuickMangaHistoryRun,
      taskSnapshot: taskMap.get(run.taskId || '') || undefined,
    }))
    .slice(0, limit)

  return NextResponse.json({
    history,
    filter: {
      status: statusFilter,
      limit,
    },
  })
})
