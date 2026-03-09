export type QuickMangaPreset = 'auto' | 'action-battle' | 'romance-drama' | 'slice-of-life' | 'comedy-4koma'

export type QuickMangaLayout = 'auto' | 'cinematic' | 'four-koma' | 'vertical-scroll'

export type QuickMangaColorMode = 'auto' | 'full-color' | 'black-white' | 'limited-palette'

export interface QuickMangaOptions {
  enabled: boolean
  preset: QuickMangaPreset
  layout: QuickMangaLayout
  colorMode: QuickMangaColorMode
}

const PRESET_DIRECTIVE_LABEL: Record<QuickMangaPreset, string> = {
  auto: 'Auto',
  'action-battle': 'Action / Battle',
  'romance-drama': 'Romance / Drama',
  'slice-of-life': 'Slice of Life',
  'comedy-4koma': 'Comedy 4-koma',
}

const LAYOUT_DIRECTIVE_LABEL: Record<QuickMangaLayout, string> = {
  auto: 'Auto',
  cinematic: 'Cinematic Panels',
  'four-koma': '4-koma Rhythm',
  'vertical-scroll': 'Vertical Scroll',
}

const COLOR_MODE_DIRECTIVE_LABEL: Record<QuickMangaColorMode, string> = {
  auto: 'Auto',
  'full-color': 'Full Color',
  'black-white': 'Black & White',
  'limited-palette': 'Limited Palette',
}

function buildQuickMangaDirective(params: {
  options: QuickMangaOptions
  artStyle?: string | null
  phase: 'story-input' | 'storyboard-refine'
}) {
  const styleLabel = params.artStyle?.trim() ? params.artStyle.trim() : 'auto'

  const phaseGuideline = params.phase === 'storyboard-refine'
    ? 'Guideline: enforce panel rhythm and shot clarity while preserving narrative continuity.'
    : 'Guideline: keep plot intact, optimize for panel-ready beats and concise scene transitions.'

  return [
    '[QUICK_MANGA_ENTRY]',
    `Preset: ${PRESET_DIRECTIVE_LABEL[params.options.preset]}`,
    `Panel Layout: ${LAYOUT_DIRECTIVE_LABEL[params.options.layout]}`,
    `Color Mode: ${COLOR_MODE_DIRECTIVE_LABEL[params.options.colorMode]}`,
    `Visual Style: ${styleLabel}`,
    phaseGuideline,
    'Guideline: preserve dialogue intent and character continuity across panels.',
  ].join('\n')
}

export function buildQuickMangaStoryInput({
  storyContent,
  options,
  artStyle,
}: {
  storyContent: string
  options: QuickMangaOptions
  artStyle?: string | null
}) {
  const baseContent = storyContent.trim()
  if (!options.enabled || !baseContent) {
    return baseContent
  }

  const directive = buildQuickMangaDirective({
    options,
    artStyle,
    phase: 'story-input',
  })

  return `${directive}\n\n${baseContent}`
}

export function buildQuickMangaStoryboardInput({
  clipContent,
  options,
  artStyle,
}: {
  clipContent: string
  options: QuickMangaOptions
  artStyle?: string | null
}) {
  const baseContent = clipContent.trim()
  if (!options.enabled || !baseContent) {
    return baseContent
  }

  const directive = buildQuickMangaDirective({
    options,
    artStyle,
    phase: 'storyboard-refine',
  })

  return `${directive}\n\n${baseContent}`
}
