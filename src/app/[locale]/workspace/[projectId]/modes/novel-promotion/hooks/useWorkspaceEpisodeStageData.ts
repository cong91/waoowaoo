'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useEpisodeData } from '@/lib/query/hooks'
import type { NovelPromotionClip, NovelPromotionStoryboard } from '@/types/project'
import { useWorkspaceProvider } from '../WorkspaceProvider'

interface EpisodeStagePayload {
  name?: string
  novelText?: string | null
  clips?: NovelPromotionClip[]
  storyboards?: NovelPromotionStoryboard[]
}

function normalizeEpisodeDisplayName(name: string | undefined, episodeLabel: string): string | undefined {
  if (!name) return name
  const trimmed = name.trim()
  const patterns = [
    /^Episode\s+(\d+)$/i,
    /^Tập\s+(\d+)$/i,
    /^第\s*(\d+)\s*集$/,
    /^에피소드\s*(\d+)$/i,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) {
      return `${episodeLabel} ${match[1]}`
    }
  }

  return name
}

export function useWorkspaceEpisodeStageData() {
  const { projectId, episodeId } = useWorkspaceProvider()
  const tCommon = useTranslations('common')
  const { data: episodeData } = useEpisodeData(projectId, episodeId || null)
  const payload = episodeData as EpisodeStagePayload | null

  const episodeName = useMemo(
    () => normalizeEpisodeDisplayName(payload?.name, tCommon('episode')),
    [payload?.name, tCommon],
  )

  return {
    episodeName,
    novelText: payload?.novelText || '',
    clips: payload?.clips || [],
    storyboards: payload?.storyboards || [],
  }
}
