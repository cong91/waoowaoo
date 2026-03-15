import { planWebtoonQuickActionMutation } from '@/lib/workspace/webtoon-panel-controls'

type LitePanel = {
  id: string
  storyboardId: string
  panelIndex: number
  description: string
  characters: string
  duration?: number
}

const basePanels: LitePanel[] = [
  { id: 'p1', storyboardId: 'sb-evidence', panelIndex: 0, description: 'Opening beat', characters: '[{"name":"Hero"}]', duration: 1.2 },
  { id: 'p2', storyboardId: 'sb-evidence', panelIndex: 1, description: 'Conflict beat', characters: '[{"name":"Hero"},{"name":"Rival"}]', duration: 2.4 },
  { id: 'p3', storyboardId: 'sb-evidence', panelIndex: 2, description: 'Reaction beat', characters: '[{"name":"Heroine"}]', duration: 1.1 },
]

function run(action: 'add' | 'duplicate' | 'split' | 'merge' | 'reorder') {
  const selectedPanelId = action === 'reorder' ? 'p3' : 'p2'
  const plan = planWebtoonQuickActionMutation({
    action,
    panels: basePanels,
    selectedPanelId,
  })

  return {
    action,
    selectedPanelId,
    beforeOrder: plan.beforeOrder,
    deletePanelIds: plan.deletePanelIds,
    createCount: plan.createPayloads.length,
    expectedAfterOrder: plan.expectedAfterOrder,
    createPayloadPreview: plan.createPayloads.map((payload, index) => ({
      index,
      shotType: payload.shotType,
      cameraMove: payload.cameraMove,
      description: payload.description,
      duration: payload.duration,
    })),
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  source: 'scripts/vat-133-quick-actions-evidence.ts',
  scenarios: [
    run('add'),
    run('duplicate'),
    run('split'),
    run('merge'),
    run('reorder'),
  ],
}

console.log(JSON.stringify(report, null, 2))
