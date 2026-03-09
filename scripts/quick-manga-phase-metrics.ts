import { logInfo as _ulogInfo, logError as _ulogError } from '@/lib/logging/core'
import { prisma } from '@/lib/prisma'

type StageKey = 'story-to-script' | 'script-to-storyboard' | 'unknown'

type Args = {
  days: number
}

function parseArgs(): Args {
  const rawDays = process.argv.find((arg) => arg.startsWith('--days='))
  const parsedDays = rawDays ? Number.parseInt(rawDays.split('=')[1], 10) : 30

  return {
    days: Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : 30,
  }
}

function dateKey(input: Date): string {
  return input.toISOString().slice(0, 10)
}

function stageFromDedupeKey(dedupeKey?: string | null): StageKey {
  if (!dedupeKey) return 'unknown'
  const parts = dedupeKey.split(':')
  const stage = parts[1]
  if (stage === 'story-to-script' || stage === 'script-to-storyboard') return stage
  return 'unknown'
}

async function main() {
  const { days } = parseArgs()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [quickTasks, coreFlowTasks] = await Promise.all([
    prisma.task.findMany({
      where: {
        dedupeKey: { startsWith: 'quick_manga:' },
        createdAt: { gte: since },
      },
      select: {
        id: true,
        userId: true,
        projectId: true,
        status: true,
        errorCode: true,
        dedupeKey: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.task.findMany({
      where: {
        createdAt: { gte: since },
        type: { in: ['story_to_script_run', 'script_to_storyboard_run'] },
      },
      select: {
        id: true,
        userId: true,
        projectId: true,
        type: true,
        status: true,
        errorCode: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const quickByStatus = new Map<string, number>()
  const quickByDay = new Map<string, number>()
  const quickByStage = new Map<StageKey, number>()
  const quickUsers = new Set<string>()
  const quickProjects = new Set<string>()

  const userTaskDates = new Map<string, Date[]>()

  for (const task of quickTasks) {
    quickByStatus.set(task.status, (quickByStatus.get(task.status) || 0) + 1)
    quickByDay.set(dateKey(task.createdAt), (quickByDay.get(dateKey(task.createdAt)) || 0) + 1)

    const stage = stageFromDedupeKey(task.dedupeKey)
    quickByStage.set(stage, (quickByStage.get(stage) || 0) + 1)

    quickUsers.add(task.userId)
    quickProjects.add(task.projectId)

    const dates = userTaskDates.get(task.userId) || []
    dates.push(task.createdAt)
    userTaskDates.set(task.userId, dates)
  }

  const coreByTypeStatus = new Map<string, number>()
  const coreProjects = new Set<string>()
  for (const task of coreFlowTasks) {
    const key = `${task.type}:${task.status}`
    coreByTypeStatus.set(key, (coreByTypeStatus.get(key) || 0) + 1)
    coreProjects.add(task.projectId)
  }

  const quickTotal = quickTasks.length
  const quickCompleted = quickByStatus.get('completed') || 0
  const quickFailed = quickByStatus.get('failed') || 0

  const quickSuccessPct = quickTotal > 0
    ? Number(((quickCompleted / quickTotal) * 100).toFixed(1))
    : null

  const adoptionVolumePct = coreFlowTasks.length > 0
    ? Number(((quickTotal / coreFlowTasks.length) * 100).toFixed(2))
    : null

  const adoptionProjectPct = coreProjects.size > 0
    ? Number(((quickProjects.size / coreProjects.size) * 100).toFixed(2))
    : null

  let repeatUsersWithin7d = 0
  let atRiskUsersNoRepeatAfter7d = 0

  const now = Date.now()
  for (const dates of userTaskDates.values()) {
    const sorted = dates.sort((a, b) => a.getTime() - b.getTime())
    if (sorted.length >= 2) {
      const deltaMs = sorted[1].getTime() - sorted[0].getTime()
      if (deltaMs <= 7 * 24 * 60 * 60 * 1000) repeatUsersWithin7d += 1
      continue
    }

    if (sorted.length === 1) {
      const ageMs = now - sorted[0].getTime()
      if (ageMs > 7 * 24 * 60 * 60 * 1000) atRiskUsersNoRepeatAfter7d += 1
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    windowDays: days,
    since: since.toISOString(),
    quickManga: {
      total: quickTotal,
      completed: quickCompleted,
      failed: quickFailed,
      successPct: quickSuccessPct,
      activeUsers: quickUsers.size,
      activeProjects: quickProjects.size,
      byStatus: Array.from(quickByStatus.entries()).map(([status, count]) => ({ status, count })),
      byStage: Array.from(quickByStage.entries()).map(([stage, count]) => ({ stage, count })),
      byDay: Array.from(quickByDay.entries()).map(([day, count]) => ({ day, count })),
      churnProxy: {
        repeatUsersWithin7d,
        atRiskUsersNoRepeatAfter7d,
      },
    },
    baselineCoreFlows: {
      total: coreFlowTasks.length,
      activeProjects: coreProjects.size,
      byTypeStatus: Array.from(coreByTypeStatus.entries()).map(([key, count]) => {
        const [type, status] = key.split(':')
        return { type, status, count }
      }),
    },
    adoptionProxy: {
      volumePctAgainstCoreFlows: adoptionVolumePct,
      projectPctAgainstCoreFlows: adoptionProjectPct,
    },
    notes: [
      'adoption/churn được tính theo tasks có dedupeKey quick_manga:*',
      'Nếu quick manga total=0 thì các chỉ số churn là không đủ dữ liệu (insufficient sample)',
    ],
  }

  _ulogInfo('[QuickMangaPhaseMetrics] ' + JSON.stringify(payload))
}

main()
  .catch((error) => {
    _ulogError('[QuickMangaPhaseMetrics] failed:', error?.message || error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
