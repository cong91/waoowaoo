import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  userPreference: {
    findUnique: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { resolveAnalysisModel } from '@/lib/workers/handlers/resolve-analysis-model'

const ORIGINAL_ENV = { ...process.env }

describe('resolveAnalysisModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...ORIGINAL_ENV }
    delete process.env.TEXT_PROVIDER
    delete process.env.OPENAI_COMPAT_BASE_URL
    delete process.env.OPENAI_COMPAT_MODEL
    delete process.env.OPENROUTER_API_KEY
    delete process.env.OPENROUTER_MODEL
    prismaMock.userPreference.findUnique.mockResolvedValue({
      analysisModel: 'openai-compatible:pref::gpt-4.1-mini',
    })
  })

  it('uses inputModel override when provided', async () => {
    const result = await resolveAnalysisModel({
      userId: 'user-1',
      inputModel: 'openai-compatible:input::gpt-4.1',
      projectAnalysisModel: 'openai-compatible:project::gpt-4.1',
    })

    expect(result).toBe('openai-compatible:input::gpt-4.1')
    expect(prismaMock.userPreference.findUnique).not.toHaveBeenCalled()
  })

  it('uses project analysisModel when inputModel is missing', async () => {
    const result = await resolveAnalysisModel({
      userId: 'user-1',
      projectAnalysisModel: 'openai-compatible:project::gpt-4.1',
    })

    expect(result).toBe('openai-compatible:project::gpt-4.1')
    expect(prismaMock.userPreference.findUnique).not.toHaveBeenCalled()
  })

  it('falls back to user preference analysisModel when project is missing', async () => {
    const result = await resolveAnalysisModel({
      userId: 'user-1',
      projectAnalysisModel: null,
    })

    expect(result).toBe('openai-compatible:pref::gpt-4.1-mini')
    expect(prismaMock.userPreference.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      select: { analysisModel: true },
    })
  })

  it('skips invalid input/project model keys and still falls back to user preference', async () => {
    const result = await resolveAnalysisModel({
      userId: 'user-1',
      inputModel: 'gpt-4.1',
      projectAnalysisModel: 'invalid-model-key',
    })

    expect(result).toBe('openai-compatible:pref::gpt-4.1-mini')
    expect(prismaMock.userPreference.findUnique).toHaveBeenCalledTimes(1)
  })

  it('falls back to env openai-compatible model when preference is missing', async () => {
    prismaMock.userPreference.findUnique.mockResolvedValueOnce({ analysisModel: null })
    process.env.TEXT_PROVIDER = 'openai-compatible'
    process.env.OPENAI_COMPAT_BASE_URL = 'https://proxy.example.com/v1'
    process.env.OPENAI_COMPAT_MODEL = 'gpt-4.1-mini'

    const result = await resolveAnalysisModel({
      userId: 'user-1',
      inputModel: '',
      projectAnalysisModel: null,
    })

    expect(result).toBe('openai-compatible::gpt-4.1-mini')
  })

  it('throws explicit error when all levels are missing', async () => {
    prismaMock.userPreference.findUnique.mockResolvedValueOnce({ analysisModel: null })

    await expect(resolveAnalysisModel({
      userId: 'user-1',
      inputModel: '',
      projectAnalysisModel: null,
    })).rejects.toThrow('ANALYSIS_MODEL_NOT_CONFIGURED')
  })
})
