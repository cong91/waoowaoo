import { RUN_STATUS, type RunStatus } from '@/lib/run-runtime/types'

export type QuickMangaHistoryStatusFilter = 'all' | 'success' | 'failed' | 'cancelled'

export type QuickMangaHistoryStage = 'story-to-script' | 'script-to-storyboard'

export type QuickMangaHistoryOptions = {
  enabled: boolean
  preset: string
  layout: string
  colorMode: string
  style: string | null
}

export type QuickMangaHistoryRun = {
  id: string
  workflowType: string
  taskId?: string | null
  episodeId?: string | null
  status: RunStatus
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  errorMessage?: string | null
  createdAt: string
  updatedAt: string
}

export type QuickMangaHistoryTaskSnapshot = {
  payload?: Record<string, unknown>
  latestEventType?: string | null
  latestEventAt?: string | null
}

export type QuickMangaHistoryItem = {
  runId: string
  taskId: string | null
  episodeId: string | null
  createdAt: string
  updatedAt: string
  stage: QuickMangaHistoryStage
  status: RunStatus
  statusBucket: Exclude<QuickMangaHistoryStatusFilter, 'all'>
  options: QuickMangaHistoryOptions
  preview: {
    inputSnippet: string | null
    outputSnippet: string | null
  }
  errorMessage: string | null
  latestEventType: string | null
  latestEventAt: string | null
}

type AnyObject = Record<string, unknown>

const QUICK_MANGA_DEFAULT_OPTIONS: QuickMangaHistoryOptions = {
  enabled: false,
  preset: 'auto',
  layout: 'auto',
  colorMode: 'auto',
  style: null,
}

function toObject(value: unknown): AnyObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as AnyObject
}

function toStringOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function toQuickMangaOptions(value: unknown): QuickMangaHistoryOptions {
  const payload = toObject(value)
  return {
    enabled: payload.enabled === true,
    preset: toStringOrNull(payload.preset) || 'auto',
    layout: toStringOrNull(payload.layout) || 'auto',
    colorMode: toStringOrNull(payload.colorMode) || 'auto',
    style: toStringOrNull(payload.style),
  }
}

function resolveStage(run: QuickMangaHistoryRun): QuickMangaHistoryStage {
  const quickMangaStage = toStringOrNull(toObject(run.input).quickMangaStage)
  if (quickMangaStage === 'script-to-storyboard') return 'script-to-storyboard'
  if (quickMangaStage === 'story-to-script') return 'story-to-script'
  return run.workflowType === 'script_to_storyboard_run'
    ? 'script-to-storyboard'
    : 'story-to-script'
}

function resolveStatusBucket(status: RunStatus): Exclude<QuickMangaHistoryStatusFilter, 'all'> {
  if (status === RUN_STATUS.COMPLETED) return 'success'
  if (status === RUN_STATUS.CANCELED || status === RUN_STATUS.CANCELING) return 'cancelled'
  return 'failed'
}

function truncateSnippet(value: string | null, maxChars = 220): string | null {
  if (!value) return null
  if (value.length <= maxChars) return value
  return `${value.slice(0, maxChars - 1)}…`
}

function resolveInputSnippet(run: QuickMangaHistoryRun): string | null {
  const input = toObject(run.input)
  return truncateSnippet(
    toStringOrNull(input.content)
    || toStringOrNull(toObject(input.meta).continuityPrompt)
    || null,
  )
}

function resolveOutputSnippet(run: QuickMangaHistoryRun): string | null {
  const output = toObject(run.output)
  const summary = toObject(output.summary)
  return truncateSnippet(
    toStringOrNull(summary.text)
    || toStringOrNull(output.message)
    || toStringOrNull(output.content)
    || null,
  )
}

function resolveQuickMangaOptions(params: {
  runInput: Record<string, unknown>
  taskPayload: Record<string, unknown>
}): QuickMangaHistoryOptions {
  const runOptions = toQuickMangaOptions(toObject(params.runInput).quickManga)
  if (runOptions.enabled) return runOptions

  const taskOptions = toQuickMangaOptions(toObject(params.taskPayload).quickManga)
  if (taskOptions.enabled) return taskOptions

  return QUICK_MANGA_DEFAULT_OPTIONS
}

export function parseQuickMangaHistoryStatusFilter(value: unknown): QuickMangaHistoryStatusFilter {
  if (value === 'success' || value === 'failed' || value === 'cancelled') return value
  return 'all'
}

export function toRunStatuses(filter: QuickMangaHistoryStatusFilter): RunStatus[] {
  if (filter === 'success') return [RUN_STATUS.COMPLETED]
  if (filter === 'failed') return [RUN_STATUS.FAILED]
  if (filter === 'cancelled') return [RUN_STATUS.CANCELING, RUN_STATUS.CANCELED]
  return [
    RUN_STATUS.COMPLETED,
    RUN_STATUS.FAILED,
    RUN_STATUS.CANCELING,
    RUN_STATUS.CANCELED,
  ]
}

export function isQuickMangaRun(params: {
  runInput: Record<string, unknown>
  taskPayload: Record<string, unknown>
}): boolean {
  const runQuickManga = toObject(params.runInput).quickManga
  const taskQuickManga = toObject(params.taskPayload).quickManga
  return toObject(runQuickManga).enabled === true || toObject(taskQuickManga).enabled === true
}

export function mapQuickMangaHistoryItem(params: {
  run: QuickMangaHistoryRun
  taskSnapshot?: QuickMangaHistoryTaskSnapshot
}): QuickMangaHistoryItem {
  const runInput = toObject(params.run.input)
  const taskPayload = toObject(params.taskSnapshot?.payload)
  const statusBucket = resolveStatusBucket(params.run.status)

  return {
    runId: params.run.id,
    taskId: params.run.taskId || null,
    episodeId: params.run.episodeId || null,
    createdAt: params.run.createdAt,
    updatedAt: params.run.updatedAt,
    stage: resolveStage(params.run),
    status: params.run.status,
    statusBucket,
    options: resolveQuickMangaOptions({
      runInput,
      taskPayload,
    }),
    preview: {
      inputSnippet: resolveInputSnippet(params.run),
      outputSnippet: resolveOutputSnippet(params.run),
    },
    errorMessage: params.run.errorMessage || null,
    latestEventType: params.taskSnapshot?.latestEventType || null,
    latestEventAt: params.taskSnapshot?.latestEventAt || null,
  }
}
