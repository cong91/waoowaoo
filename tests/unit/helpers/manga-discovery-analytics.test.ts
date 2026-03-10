import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackWorkspaceMangaEvent } from '@/lib/workspace/manga-discovery-analytics'
import { logEvent } from '@/lib/logging/core'

vi.mock('@/lib/logging/core', () => ({
  logEvent: vi.fn(),
}))

describe('manga discovery analytics helper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('emits structured workspace manga discovery event', () => {
    trackWorkspaceMangaEvent('workspace_manga_cta_click', {
      surface: 'workspace_card',
      locale: 'vi',
    })

    expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({
      level: 'INFO',
      module: 'workspace',
      action: 'WORKSPACE_MANGA_DISCOVERY',
      message: 'workspace_manga_cta_click',
      details: expect.objectContaining({
        event: 'workspace_manga_cta_click',
        surface: 'workspace_card',
        locale: 'vi',
      }),
    }))
  })

  it('emits project created telemetry with selected mode', () => {
    trackWorkspaceMangaEvent('workspace_project_created', {
      surface: 'create_project_modal',
      locale: 'vi',
      projectMode: 'manga',
      projectId: 'project-123',
    })

    expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({
      level: 'INFO',
      module: 'workspace',
      action: 'WORKSPACE_MANGA_DISCOVERY',
      message: 'workspace_project_created',
      details: expect.objectContaining({
        event: 'workspace_project_created',
        surface: 'create_project_modal',
        locale: 'vi',
        projectMode: 'manga',
        projectId: 'project-123',
      }),
    }))
  })
})
