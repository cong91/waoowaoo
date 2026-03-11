'use client'

import type {
  QuickMangaColorMode,
  QuickMangaLayout,
  QuickMangaPreset,
} from '@/lib/novel-promotion/quick-manga'
import type {
  QuickMangaContinuityConflictPolicy,
  QuickMangaStyleLockProfile,
} from '@/lib/novel-promotion/quick-manga-contract'
import { MANGA_PANEL_TEMPLATE_SPECS } from '@/lib/workspace/manga-webtoon-layout-map'

interface MangaPanelControlsProps {
  enabled: boolean
  preset: QuickMangaPreset
  layout: QuickMangaLayout
  colorMode: QuickMangaColorMode
  styleLockEnabled: boolean
  styleLockProfile: QuickMangaStyleLockProfile
  styleLockStrength: number
  conflictPolicy: QuickMangaContinuityConflictPolicy
  onEnabledChange: (enabled: boolean) => Promise<void>
  onPresetChange: (value: QuickMangaPreset) => Promise<void>
  onLayoutChange: (value: QuickMangaLayout) => Promise<void>
  onColorModeChange: (value: QuickMangaColorMode) => Promise<void>
  onStyleLockEnabledChange: (enabled: boolean) => Promise<void>
  onStyleLockProfileChange: (value: QuickMangaStyleLockProfile) => Promise<void>
  onStyleLockStrengthChange: (value: number) => Promise<void>
  onConflictPolicyChange: (value: QuickMangaContinuityConflictPolicy) => Promise<void>
  compact?: boolean
}

const PANEL_TEMPLATES = MANGA_PANEL_TEMPLATE_SPECS

const STORY_KITS: Array<{
  id: string
  label: string
  helper: string
  values: {
    preset: QuickMangaPreset
    layout: QuickMangaLayout
    colorMode: QuickMangaColorMode
    styleLockEnabled: boolean
    styleLockProfile: QuickMangaStyleLockProfile
    styleLockStrength: number
    conflictPolicy: QuickMangaContinuityConflictPolicy
  }
}> = [
  {
    id: 'setup',
    label: 'Setup',
    helper: 'Thiết lập bối cảnh và nhịp đọc mở đầu dễ theo dõi.',
    values: {
      preset: 'slice-of-life',
      layout: 'vertical-scroll',
      colorMode: 'full-color',
      styleLockEnabled: true,
      styleLockProfile: 'soft-tones',
      styleLockStrength: 0.65,
      conflictPolicy: 'balanced',
    },
  },
  {
    id: 'continuity',
    label: 'Continuity',
    helper: 'Giữ nhân vật/đạo cụ ổn định giữa các panel liền nhau.',
    values: {
      preset: 'romance-drama',
      layout: 'vertical-scroll',
      colorMode: 'full-color',
      styleLockEnabled: true,
      styleLockProfile: 'line-consistent',
      styleLockStrength: 0.82,
      conflictPolicy: 'prefer-chapter-context',
    },
  },
  {
    id: 'action',
    label: 'Action',
    helper: 'Tăng lực chuyển động, giữ bố cục panel rõ hướng mắt đọc.',
    values: {
      preset: 'action-battle',
      layout: 'cinematic',
      colorMode: 'black-white',
      styleLockEnabled: true,
      styleLockProfile: 'ink-contrast',
      styleLockStrength: 0.78,
      conflictPolicy: 'balanced',
    },
  },
  {
    id: 'dialogue',
    label: 'Dialogue',
    helper: 'Ưu tiên biểu cảm và khoảng trống cho balloon hội thoại.',
    values: {
      preset: 'romance-drama',
      layout: 'four-koma',
      colorMode: 'full-color',
      styleLockEnabled: true,
      styleLockProfile: 'soft-tones',
      styleLockStrength: 0.7,
      conflictPolicy: 'prefer-style-lock',
    },
  },
  {
    id: 'transition',
    label: 'Transition',
    helper: 'Nối nhịp giữa cảnh trước/sau bằng panel chuyển mượt.',
    values: {
      preset: 'auto',
      layout: 'vertical-scroll',
      colorMode: 'limited-palette',
      styleLockEnabled: true,
      styleLockProfile: 'line-consistent',
      styleLockStrength: 0.68,
      conflictPolicy: 'balanced',
    },
  },
  {
    id: 'opening',
    label: 'Opening',
    helper: 'Mở tập bằng hook mạnh, ưu tiên nhận diện nhân vật chính.',
    values: {
      preset: 'action-battle',
      layout: 'splash-focus',
      colorMode: 'full-color',
      styleLockEnabled: true,
      styleLockProfile: 'line-consistent',
      styleLockStrength: 0.74,
      conflictPolicy: 'prefer-style-lock',
    },
  },
  {
    id: 'conflict',
    label: 'Conflict',
    helper: 'Đẩy đối kháng bằng tương phản hành động và biểu cảm.',
    values: {
      preset: 'action-battle',
      layout: 'cinematic',
      colorMode: 'black-white',
      styleLockEnabled: true,
      styleLockProfile: 'ink-contrast',
      styleLockStrength: 0.85,
      conflictPolicy: 'balanced',
    },
  },
  {
    id: 'payoff',
    label: 'Payoff',
    helper: 'Chốt cảm xúc/kết quả bằng nhịp panel rõ, dễ đọng lại.',
    values: {
      preset: 'slice-of-life',
      layout: 'splash-focus',
      colorMode: 'limited-palette',
      styleLockEnabled: true,
      styleLockProfile: 'soft-tones',
      styleLockStrength: 0.72,
      conflictPolicy: 'prefer-chapter-context',
    },
  },
  {
    id: 'cliffhanger',
    label: 'Cliffhanger',
    helper: 'Kết đoạn bằng panel treo, giữ tò mò cho chapter kế tiếp.',
    values: {
      preset: 'romance-drama',
      layout: 'vertical-scroll',
      colorMode: 'limited-palette',
      styleLockEnabled: true,
      styleLockProfile: 'line-consistent',
      styleLockStrength: 0.8,
      conflictPolicy: 'prefer-style-lock',
    },
  },
]

export default function MangaPanelControls({
  enabled,
  preset,
  layout,
  colorMode,
  styleLockEnabled,
  styleLockProfile,
  styleLockStrength,
  conflictPolicy,
  onEnabledChange,
  onPresetChange,
  onLayoutChange,
  onColorModeChange,
  onStyleLockEnabledChange,
  onStyleLockProfileChange,
  onStyleLockStrengthChange,
  onConflictPolicyChange,
  compact = false,
}: MangaPanelControlsProps) {
  const applyValues = (values: {
    preset: QuickMangaPreset
    layout: QuickMangaLayout
    colorMode: QuickMangaColorMode
    styleLockEnabled: boolean
    styleLockProfile: QuickMangaStyleLockProfile
    styleLockStrength: number
    conflictPolicy?: QuickMangaContinuityConflictPolicy
  }) => {
    void Promise.all([
      onEnabledChange(true),
      onPresetChange(values.preset),
      onLayoutChange(values.layout),
      onColorModeChange(values.colorMode),
      onStyleLockEnabledChange(values.styleLockEnabled),
      onStyleLockProfileChange(values.styleLockProfile),
      onStyleLockStrengthChange(values.styleLockStrength),
      ...(values.conflictPolicy ? [onConflictPolicyChange(values.conflictPolicy)] : []),
    ])
  }

  const applyTemplate = (template: (typeof PANEL_TEMPLATES)[number]) => {
    applyValues(template.values)
  }

  const applyStoryKit = (kit: (typeof STORY_KITS)[number]) => {
    applyValues(kit.values)
  }

  return (
    <section className={`glass-surface ${compact ? 'p-4' : 'p-6'} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--glass-text-primary)]">Manga Storytelling Controls</h3>
          <p className="text-xs text-[var(--glass-text-tertiary)] mt-1">
            Panel-first controls cho lane Manga/Webtoon (P1) — ưu tiên ngôn ngữ kể chuyện theo panel, không dùng semantics video-like.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onEnabledChange(!enabled)}
          className={`glass-btn-base px-3 py-1.5 text-xs font-medium ${enabled ? 'glass-btn-tone-info' : 'glass-btn-secondary'}`}
        >
          {enabled ? 'Manga lane: ON' : 'Bật Manga lane'}
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-[var(--glass-text-secondary)] uppercase tracking-wide">Panel template</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PANEL_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template)}
              className="rounded-xl border border-[var(--glass-stroke-soft)] bg-[var(--glass-bg-muted)]/15 hover:bg-[var(--glass-bg-muted)]/30 transition-colors p-3 text-left"
            >
              <div className="text-sm font-semibold text-[var(--glass-text-primary)]">{template.title}</div>
              <p className="text-xs text-[var(--glass-text-tertiary)] mt-1">{template.description}</p>
              <p className="text-[11px] text-[var(--glass-text-secondary)] mt-2">
                {template.values.layout} · {template.values.colorMode}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-[var(--glass-text-secondary)] uppercase tracking-wide">Storytelling prompt kit</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {STORY_KITS.map((kit) => (
            <button
              key={kit.id}
              type="button"
              onClick={() => applyStoryKit(kit)}
              className="rounded-xl border border-[var(--glass-stroke-soft)] bg-[var(--glass-bg-muted)]/10 hover:bg-[var(--glass-bg-muted)]/30 transition-colors p-3 text-left"
            >
              <div className="text-sm font-semibold text-[var(--glass-text-primary)]">{kit.label}</div>
              <p className="text-xs text-[var(--glass-text-tertiary)] mt-1">{kit.helper}</p>
              <p className="text-[11px] text-[var(--glass-text-secondary)] mt-2">
                {kit.values.preset} · {kit.values.layout} · {kit.values.colorMode}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--glass-stroke-soft)] bg-[var(--glass-bg-muted)]/10 p-3 space-y-3">
        <div className="text-xs text-[var(--glass-text-tertiary)]">
          Active: <span className="text-[var(--glass-text-primary)] font-medium">{preset}</span> ·{' '}
          <span className="text-[var(--glass-text-primary)] font-medium">{layout}</span> ·{' '}
          <span className="text-[var(--glass-text-primary)] font-medium">{colorMode}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--glass-text-tertiary)]">Style lock:</span>
          <button
            type="button"
            onClick={() => void onStyleLockEnabledChange(!styleLockEnabled)}
            className={`glass-btn-base px-2.5 py-1 text-xs ${styleLockEnabled ? 'glass-btn-tone-info' : 'glass-btn-secondary'}`}
          >
            {styleLockEnabled ? 'Enabled' : 'Disabled'}
          </button>
          <span className="text-xs text-[var(--glass-text-secondary)]">profile: {styleLockProfile}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--glass-text-tertiary)]">Strength:</span>
          {[0.55, 0.7, 0.85].map((value) => {
            const active = Math.abs(styleLockStrength - value) < 0.01
            return (
              <button
                key={value}
                type="button"
                onClick={() => void onStyleLockStrengthChange(value)}
                className={`glass-btn-base px-2.5 py-1 text-xs ${active ? 'glass-btn-tone-info' : 'glass-btn-secondary'}`}
              >
                {Math.round(value * 100)}%
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--glass-text-tertiary)]">Conflict policy:</span>
          {(['balanced', 'prefer-style-lock', 'prefer-chapter-context'] as const).map((policy) => (
            <button
              key={policy}
              type="button"
              onClick={() => void onConflictPolicyChange(policy)}
              className={`glass-btn-base px-2.5 py-1 text-xs ${conflictPolicy === policy ? 'glass-btn-tone-info' : 'glass-btn-secondary'}`}
            >
              {policy}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
