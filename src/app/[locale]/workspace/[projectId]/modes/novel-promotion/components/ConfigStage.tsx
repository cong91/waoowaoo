'use client'

import NovelInputStage from './NovelInputStage'
import { useWorkspaceStageRuntime } from '../WorkspaceStageRuntimeContext'
import { useWorkspaceEpisodeStageData } from '../hooks/useWorkspaceEpisodeStageData'

export default function ConfigStage() {
  const runtime = useWorkspaceStageRuntime()
  const { episodeName, novelText } = useWorkspaceEpisodeStageData()

  return (
    <NovelInputStage
      novelText={novelText}
      episodeName={episodeName}
      onNovelTextChange={runtime.onNovelTextChange}
      isSubmittingTask={runtime.isSubmittingTTS}
      isSwitchingStage={runtime.isTransitioning}
      quickMangaEnabled={runtime.quickMangaEnabled}
      quickMangaPreset={runtime.quickMangaPreset}
      quickMangaLayout={runtime.quickMangaLayout}
      quickMangaColorMode={runtime.quickMangaColorMode}
      onQuickMangaEnabledChange={runtime.onQuickMangaEnabledChange}
      onQuickMangaPresetChange={runtime.onQuickMangaPresetChange}
      onQuickMangaLayoutChange={runtime.onQuickMangaLayoutChange}
      onQuickMangaColorModeChange={runtime.onQuickMangaColorModeChange}
      videoRatio={runtime.videoRatio ?? undefined}
      artStyle={runtime.artStyle ?? undefined}
      onVideoRatioChange={runtime.onVideoRatioChange}
      onArtStyleChange={runtime.onArtStyleChange}
      onNext={runtime.onRunStoryToScript}
    />
  )
}
