import type {
  QuickMangaColorMode,
  QuickMangaLayout,
  QuickMangaPreset,
} from '@/lib/novel-promotion/quick-manga'
import type { QuickMangaStyleLockProfile } from '@/lib/novel-promotion/quick-manga-contract'

export type MangaTemplateCategory = 'manga-page-layout-template'
export type MangaTemplateOrientation = 'portrait'
export type MangaTemplatePreviewFit = 'contain'
export type MangaTemplateReadingFlow = 'top-to-bottom' | 'top-left-to-bottom-right' | 'top-right-to-bottom-left'
export type MangaTemplateTransitionStyle = 'hard-cut' | 'match-cut' | 'beat-to-beat' | 'slow-pan'
export type MangaTemplateDialogueDensity = 'low' | 'medium' | 'high'

export interface MangaPanelTemplateMetadata {
  panelLayoutId: string
  imagePath: string
  category: MangaTemplateCategory
  orientation: MangaTemplateOrientation
  previewFit: MangaTemplatePreviewFit
  aspectRatio: '2:3'
  sourceWidth: number
  sourceHeight: number
  layoutFamily: string
  panelSlotCount: number
  emphasisPattern: string
  narrativeIntent: string
  readingFlow: MangaTemplateReadingFlow
  suggestedColorMode: QuickMangaColorMode
  suggestedStylePreset: QuickMangaPreset
  promptHint: string
  negativePromptHint: string
  transitionStyle: MangaTemplateTransitionStyle
  dialogueDensity: MangaTemplateDialogueDensity
  useCase: string
}

export interface MangaPanelTemplateSpec {
  id: string
  sourceLayoutId: string
  sourceReferencePresetId: string
  title: string
  description: string
  metadata: MangaPanelTemplateMetadata
  traceability: {
    layoutMapPath: string
    sourceTemplateFile: string
    referencePresetId: string
  }
  values: {
    preset: QuickMangaPreset
    layout: QuickMangaLayout
    colorMode: QuickMangaColorMode
    styleLockEnabled: boolean
    styleLockProfile: QuickMangaStyleLockProfile
    styleLockStrength: number
  }
}

export interface MangaPanelTemplateNarrativeBeat {
  slot: number
  beat: string
  purpose: string
}

function createSpec(input: {
  id: string
  sourceLayoutId: string
  sourceReferencePresetId: string
  title: string
  description: string
  metadata: Omit<MangaPanelTemplateMetadata, 'panelLayoutId' | 'imagePath' | 'category' | 'orientation' | 'previewFit' | 'aspectRatio'>
  sourceTemplateFile: string
  values: MangaPanelTemplateSpec['values']
}): MangaPanelTemplateSpec {
  return {
    id: input.id,
    sourceLayoutId: input.sourceLayoutId,
    sourceReferencePresetId: input.sourceReferencePresetId,
    title: input.title,
    description: input.description,
    metadata: {
      panelLayoutId: input.sourceLayoutId,
      imagePath: `/images/anifun/panel-templates/${input.sourceTemplateFile}`,
      category: 'manga-page-layout-template',
      orientation: 'portrait',
      previewFit: 'contain',
      aspectRatio: '2:3',
      ...input.metadata,
    },
    traceability: {
      layoutMapPath: 'docs/ux/layout_map.json',
      sourceTemplateFile: `panel-templates/${input.sourceTemplateFile}`,
      referencePresetId: input.sourceReferencePresetId,
    },
    values: input.values,
  }
}

/**
 * VAT manga/webtoon panel template catalog (usable slice + real assets)
 * Source of truth (research traceability): docs/ux/layout_map.json
 */
export const MANGA_PANEL_TEMPLATE_SPECS: MangaPanelTemplateSpec[] = [
  createSpec({
    id: 'anifun-t01-cinematic-complex',
    sourceLayoutId: 'anifun_t01',
    sourceReferencePresetId: 'anifun_preset_02_superhero_food',
    title: 'Cinematic Complex',
    description: 'Trang mở cảnh động, nhịp nhanh với panel điểm nhấn.',
    sourceTemplateFile: '01_52519e234bbf8a4801bfd86a361aae95.png',
    metadata: {
      sourceWidth: 350,
      sourceHeight: 525,
      layoutFamily: 'cinematic-complex',
      panelSlotCount: 5,
      emphasisPattern: 'hero-top with supporting cuts',
      narrativeIntent: 'Trang mở cảnh động, nhịp nhanh với điểm nhấn nhân vật.',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'auto',
      suggestedStylePreset: 'action-battle',
      promptHint: 'Mở cảnh với chuyển động mạnh, panel chính đặt điểm rơi cảm xúc.',
      negativePromptHint: 'Tránh dàn cảnh tĩnh, tránh chia panel đều gây mất nhịp hành động.',
      transitionStyle: 'hard-cut',
      dialogueDensity: 'medium',
      useCase: 'opening-action',
    },
    values: {
      preset: 'action-battle',
      layout: 'cinematic',
      colorMode: 'auto',
      styleLockEnabled: true,
      styleLockProfile: 'ink-contrast',
      styleLockStrength: 0.76,
    },
  }),
  createSpec({
    id: 'anifun-t02-cinematic-zigzag',
    sourceLayoutId: 'anifun_t02',
    sourceReferencePresetId: 'anifun_preset_04_confession_summer',
    title: 'Cinematic Zigzag',
    description: 'Nhịp zigzag xen kẽ đối thoại và hành động.',
    sourceTemplateFile: '02_abce6785736850b48b21d38f0fb017cf.webp',
    metadata: {
      sourceWidth: 350,
      sourceHeight: 525,
      layoutFamily: 'cinematic-zigzag',
      panelSlotCount: 6,
      emphasisPattern: 'alternating wide-narrow zigzag',
      narrativeIntent: 'Đối thoại xen kẽ hành động, phân nhịp theo beat dọc.',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'limited-palette',
      suggestedStylePreset: 'romance-drama',
      promptHint: 'Đi theo nhịp zigzag, mỗi panel kế tiếp đẩy conflict lên một nấc.',
      negativePromptHint: 'Tránh để thoại dồn vào một panel, tránh bố cục đối xứng cứng.',
      transitionStyle: 'beat-to-beat',
      dialogueDensity: 'high',
      useCase: 'dialogue-action-hybrid',
    },
    values: {
      preset: 'romance-drama',
      layout: 'cinematic',
      colorMode: 'limited-palette',
      styleLockEnabled: true,
      styleLockProfile: 'line-consistent',
      styleLockStrength: 0.74,
    },
  }),
  createSpec({
    id: 'anifun-t03-diagonal-focus',
    sourceLayoutId: 'anifun_t03',
    sourceReferencePresetId: 'anifun_preset_05_busy_day_witch',
    title: 'Diagonal Focus',
    description: 'Panel nhấn lớn + panel phụ build tension.',
    sourceTemplateFile: '03_df5a41e5d7e137c696b9094c5fe4aa30.webp',
    metadata: {
      sourceWidth: 350,
      sourceHeight: 525,
      layoutFamily: 'cinematic-diagonal-focus',
      panelSlotCount: 5,
      emphasisPattern: 'diagonal focal anchor',
      narrativeIntent: 'Trang chuyển cảnh có panel nhấn lớn + các panel phụ build tension.',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'black-white',
      suggestedStylePreset: 'action-battle',
      promptHint: 'Giữ trục chéo làm lực dẫn mắt đọc, panel nhấn chốt cảm xúc chuyển cảnh.',
      negativePromptHint: 'Tránh cắt vụn hành động thành các frame nhỏ thiếu điểm nhấn.',
      transitionStyle: 'match-cut',
      dialogueDensity: 'medium',
      useCase: 'transition-tension',
    },
    values: {
      preset: 'action-battle',
      layout: 'cinematic',
      colorMode: 'black-white',
      styleLockEnabled: true,
      styleLockProfile: 'ink-contrast',
      styleLockStrength: 0.8,
    },
  }),
  createSpec({
    id: 'anifun-t04-single-splash',
    sourceLayoutId: 'anifun_t04',
    sourceReferencePresetId: 'anifun_preset_06_sexy_beauty_day',
    title: 'Single Splash',
    description: 'Hero shot / cover reveal toàn trang.',
    sourceTemplateFile: '04_temp_a7f9e68e1e8aed6e019da3eeb572f8fb.png',
    metadata: {
      sourceWidth: 200,
      sourceHeight: 282,
      layoutFamily: 'single-splash',
      panelSlotCount: 1,
      emphasisPattern: 'single full-page hero',
      narrativeIntent: 'Cover/hero shot, reveal nhân vật hoặc key visual.',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'full-color',
      suggestedStylePreset: 'action-battle',
      promptHint: 'Tạo một khung hình hero rõ silhouette, hậu cảnh hỗ trợ mood nhân vật.',
      negativePromptHint: 'Tránh chèn nhiều balloon thoại và object gây rối.',
      transitionStyle: 'slow-pan',
      dialogueDensity: 'low',
      useCase: 'cover-reveal',
    },
    values: {
      preset: 'action-battle',
      layout: 'splash-focus',
      colorMode: 'full-color',
      styleLockEnabled: true,
      styleLockProfile: 'line-consistent',
      styleLockStrength: 0.72,
    },
  }),
  createSpec({
    id: 'anifun-t05-dual-split',
    sourceLayoutId: 'anifun_t05',
    sourceReferencePresetId: 'anifun_preset_01_school_romance',
    title: 'Dual Split',
    description: 'Before/after hoặc đối thoại song song 2 panel.',
    sourceTemplateFile: '05_temp_4423e55dcad38c07d6782dda3b064499.png',
    metadata: {
      sourceWidth: 200,
      sourceHeight: 282,
      layoutFamily: 'dual-split',
      panelSlotCount: 2,
      emphasisPattern: 'balanced dual beats',
      narrativeIntent: 'Before/after, setup/payoff hoặc đối thoại song song.',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'black-white',
      suggestedStylePreset: 'romance-drama',
      promptHint: 'Panel 1 setup rõ ngữ cảnh, panel 2 payoff cảm xúc hoặc hành động.',
      negativePromptHint: 'Tránh để hai panel có cùng cỡ thông tin khiến nhịp kể chuyện phẳng.',
      transitionStyle: 'match-cut',
      dialogueDensity: 'medium',
      useCase: 'setup-payoff',
    },
    values: {
      preset: 'romance-drama',
      layout: 'splash-focus',
      colorMode: 'black-white',
      styleLockEnabled: true,
      styleLockProfile: 'soft-tones',
      styleLockStrength: 0.68,
    },
  }),
  createSpec({
    id: 'anifun-t06-triple-strip',
    sourceLayoutId: 'anifun_t06',
    sourceReferencePresetId: 'anifun_preset_03_cat_cafe_jp',
    title: 'Triple Strip',
    description: '3-beat progression setup → escalation → payoff.',
    sourceTemplateFile: '06_temp_10f2cc27bb7aa1b6413d12a1f6765bf7.png',
    metadata: {
      sourceWidth: 200,
      sourceHeight: 282,
      layoutFamily: 'triple-strip',
      panelSlotCount: 3,
      emphasisPattern: 'stacked equal progression',
      narrativeIntent: '3-beat progression: setup -> escalation -> payoff.',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'limited-palette',
      suggestedStylePreset: 'slice-of-life',
      promptHint: 'Giữ nhịp ba bước rõ ràng, mỗi panel tăng stakes một chút.',
      negativePromptHint: 'Tránh thay đổi góc máy đột ngột làm đứt mạch ba-beat.',
      transitionStyle: 'beat-to-beat',
      dialogueDensity: 'medium',
      useCase: 'mini-arc-3beat',
    },
    values: {
      preset: 'slice-of-life',
      layout: 'splash-focus',
      colorMode: 'limited-palette',
      styleLockEnabled: true,
      styleLockProfile: 'soft-tones',
      styleLockStrength: 0.66,
    },
  }),
  createSpec({
    id: 'anifun-t07-quad-grid-equal',
    sourceLayoutId: 'anifun_t07',
    sourceReferencePresetId: 'anifun_preset_03_cat_cafe_jp',
    title: 'Quad Grid Equal',
    description: 'Nhịp đều 4 panel cho thoại/hài.',
    sourceTemplateFile: '07_temp_5344e7516616eeec1f6548c42106dfa8.webp',
    metadata: {
      sourceWidth: 200,
      sourceHeight: 282,
      layoutFamily: 'quad-grid-equal',
      panelSlotCount: 4,
      emphasisPattern: 'balanced 2x2 grid',
      narrativeIntent: 'Nhịp đều cho hội thoại/nhịp hài 4-beat.',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'black-white',
      suggestedStylePreset: 'comedy-4koma',
      promptHint: 'Bám nhịp 4-beat: setup, build, turn, punchline.',
      negativePromptHint: 'Tránh panel chênh kích thước làm vỡ nhịp gag.',
      transitionStyle: 'beat-to-beat',
      dialogueDensity: 'high',
      useCase: 'comedy-4koma',
    },
    values: {
      preset: 'comedy-4koma',
      layout: 'four-koma',
      colorMode: 'black-white',
      styleLockEnabled: true,
      styleLockProfile: 'line-consistent',
      styleLockStrength: 0.7,
    },
  }),
  createSpec({
    id: 'anifun-t08-quad-grid-portrait',
    sourceLayoutId: 'anifun_t08',
    sourceReferencePresetId: 'anifun_preset_01_school_romance',
    title: 'Quad Portrait Focus',
    description: '4 panel thiên biểu cảm gương mặt.',
    sourceTemplateFile: '08_temp_a5cfbc301b677668d03238a124def56e.png',
    metadata: {
      sourceWidth: 200,
      sourceHeight: 282,
      layoutFamily: 'quad-grid-portrait',
      panelSlotCount: 4,
      emphasisPattern: 'portrait 2x2 close-up grid',
      narrativeIntent: '4 panel ưu tiên cận cảnh nhân vật, cảm xúc liên tục.',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'limited-palette',
      suggestedStylePreset: 'romance-drama',
      promptHint: 'Ưu tiên close-up và micro-expression liên tục giữa các panel.',
      negativePromptHint: 'Tránh thêm quá nhiều toàn cảnh làm loãng trục cảm xúc.',
      transitionStyle: 'match-cut',
      dialogueDensity: 'high',
      useCase: 'emotion-dialogue',
    },
    values: {
      preset: 'romance-drama',
      layout: 'four-koma',
      colorMode: 'limited-palette',
      styleLockEnabled: true,
      styleLockProfile: 'soft-tones',
      styleLockStrength: 0.75,
    },
  }),
  createSpec({
    id: 'anifun-t09-quad-mixed-focus',
    sourceLayoutId: 'anifun_t09',
    sourceReferencePresetId: 'anifun_preset_05_busy_day_witch',
    title: 'Quad Mixed Focus',
    description: '1 panel lớn + 3 panel phụ cho twist/reaction.',
    sourceTemplateFile: '09_temp_f6f04f53b320e956d1402edf0b07fc29.png',
    metadata: {
      sourceWidth: 200,
      sourceHeight: 282,
      layoutFamily: 'quad-mixed-focus',
      panelSlotCount: 4,
      emphasisPattern: 'hero beat with support reactions',
      narrativeIntent: '1 panel lớn + 3 panel phụ để nhấn twist hoặc reaction.',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'auto',
      suggestedStylePreset: 'action-battle',
      promptHint: 'Dùng panel lớn làm điểm nổ, 3 panel còn lại làm nhịp dẫn/echo.',
      negativePromptHint: 'Tránh để panel lớn chứa thông tin phụ, làm mất điểm nhấn twist.',
      transitionStyle: 'hard-cut',
      dialogueDensity: 'medium',
      useCase: 'twist-reveal',
    },
    values: {
      preset: 'action-battle',
      layout: 'cinematic',
      colorMode: 'auto',
      styleLockEnabled: true,
      styleLockProfile: 'ink-contrast',
      styleLockStrength: 0.77,
    },
  }),
  createSpec({
    id: 'anifun-t10-dense-six-panel',
    sourceLayoutId: 'anifun_t10',
    sourceReferencePresetId: 'anifun_preset_02_superhero_food',
    title: 'Dense Six Panel',
    description: 'Trang dày thông tin, phù hợp montage/điều tra.',
    sourceTemplateFile: '10_temp_6ad28cc3e8e2ef052db60e2d204f6290.png',
    metadata: {
      sourceWidth: 200,
      sourceHeight: 282,
      layoutFamily: 'dense-six-panel',
      panelSlotCount: 6,
      emphasisPattern: 'alternating asymmetric rhythm',
      narrativeIntent: 'Trang dày thông tin (điều tra, hành động nhanh, montage).',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'black-white',
      suggestedStylePreset: 'action-battle',
      promptHint: 'Giữ thông tin cô đọng từng panel, chuyển cảnh nhanh nhưng vẫn đọc rõ.',
      negativePromptHint: 'Tránh balloon thoại dài; mỗi panel chỉ 1 hành động cốt lõi.',
      transitionStyle: 'hard-cut',
      dialogueDensity: 'high',
      useCase: 'montage-investigation',
    },
    values: {
      preset: 'action-battle',
      layout: 'cinematic',
      colorMode: 'black-white',
      styleLockEnabled: true,
      styleLockProfile: 'ink-contrast',
      styleLockStrength: 0.82,
    },
  }),
  createSpec({
    id: 'anifun-t11-quad-hero-bottom',
    sourceLayoutId: 'anifun_t11',
    sourceReferencePresetId: 'anifun_preset_04_confession_summer',
    title: 'Hero Bottom Payoff',
    description: 'Build-up phía trên, payoff mạnh ở panel dưới.',
    sourceTemplateFile: '11_temp_ba7ccdcb68bfd98af4a180f5adfc5df6.webp',
    metadata: {
      sourceWidth: 200,
      sourceHeight: 282,
      layoutFamily: 'quad-hero-bottom',
      panelSlotCount: 4,
      emphasisPattern: 'small setup, hero payoff bottom',
      narrativeIntent: 'Nhịp buildup ở trên, payoff mạnh ở panel dưới cùng.',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'full-color',
      suggestedStylePreset: 'romance-drama',
      promptHint: 'Tăng dần cảm xúc ở 3 panel đầu, panel cuối chốt bằng hero reaction.',
      negativePromptHint: 'Tránh dồn climax sớm vào panel đầu.',
      transitionStyle: 'beat-to-beat',
      dialogueDensity: 'medium',
      useCase: 'buildup-payoff',
    },
    values: {
      preset: 'romance-drama',
      layout: 'vertical-scroll',
      colorMode: 'full-color',
      styleLockEnabled: true,
      styleLockProfile: 'line-consistent',
      styleLockStrength: 0.78,
    },
  }),
  createSpec({
    id: 'anifun-t12-dual-hero-support',
    sourceLayoutId: 'anifun_t12',
    sourceReferencePresetId: 'anifun_preset_06_sexy_beauty_day',
    title: 'Dual Hero Support',
    description: '1 panel chính + 1 panel hỗ trợ ngữ cảnh.',
    sourceTemplateFile: '12_temp_96e97b1ac042c5fc7231d5824d7bb1b1.webp',
    metadata: {
      sourceWidth: 200,
      sourceHeight: 282,
      layoutFamily: 'dual-hero-support',
      panelSlotCount: 2,
      emphasisPattern: 'small setup, larger support payoff',
      narrativeIntent: '1 panel chính + 1 panel ngữ cảnh để nhấn cảm xúc/chuyển cảnh.',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'full-color',
      suggestedStylePreset: 'slice-of-life',
      promptHint: 'Panel hero giữ trọng tâm nhân vật, panel còn lại cung cấp context rõ.',
      negativePromptHint: 'Tránh chia đôi trọng tâm khiến cả hai panel đều nửa vời.',
      transitionStyle: 'match-cut',
      dialogueDensity: 'low',
      useCase: 'hero-context-pair',
    },
    values: {
      preset: 'slice-of-life',
      layout: 'splash-focus',
      colorMode: 'full-color',
      styleLockEnabled: true,
      styleLockProfile: 'soft-tones',
      styleLockStrength: 0.69,
    },
  }),
  createSpec({
    id: 'anifun-t13-triple-focus',
    sourceLayoutId: 'anifun_t13',
    sourceReferencePresetId: 'anifun_preset_03_cat_cafe_jp',
    title: 'Triple Focus',
    description: '3 panel gọn cho mini-arc cảm xúc.',
    sourceTemplateFile: '13_temp_6892573eae1c2d46ef550e25c75c973a.webp',
    metadata: {
      sourceWidth: 200,
      sourceHeight: 282,
      layoutFamily: 'triple-focus',
      panelSlotCount: 3,
      emphasisPattern: 'hero top with dual follow-up',
      narrativeIntent: '3 panel tập trung nhịp cảm xúc hoặc mini-arc gọn.',
      readingFlow: 'top-to-bottom',
      suggestedColorMode: 'limited-palette',
      suggestedStylePreset: 'slice-of-life',
      promptHint: 'Thiết kế mini-arc ngắn gọn: mở cảm xúc, phát triển, chốt dư âm.',
      negativePromptHint: 'Tránh nhồi sub-plot phụ làm loãng mạch 3 panel.',
      transitionStyle: 'slow-pan',
      dialogueDensity: 'medium',
      useCase: 'mini-emotional-arc',
    },
    values: {
      preset: 'slice-of-life',
      layout: 'four-koma',
      colorMode: 'limited-palette',
      styleLockEnabled: true,
      styleLockProfile: 'line-consistent',
      styleLockStrength: 0.7,
    },
  }),
]

export function getMangaPanelTemplateSemanticSummary(spec: MangaPanelTemplateSpec): string {
  return `${spec.metadata.panelSlotCount} panels · ${spec.metadata.layoutFamily} · ${spec.metadata.emphasisPattern}`
}

export function getMangaPanelTemplateReadingLabel(spec: MangaPanelTemplateSpec): string {
  if (spec.metadata.readingFlow === 'top-to-bottom') return 'Top-to-bottom'
  if (spec.metadata.readingFlow === 'top-left-to-bottom-right') return 'Top-left to bottom-right'
  return 'Top-right to bottom-left'
}

export function getMangaPanelTemplateSelectorLabel(spec: MangaPanelTemplateSpec): string {
  return `${spec.title} · ${spec.metadata.panelSlotCount} panels`
}

export function getMangaPanelTemplateSelectorSummary(spec: MangaPanelTemplateSpec): string {
  return `${spec.metadata.useCase} · ${getMangaPanelTemplateReadingLabel(spec)} · ${spec.metadata.previewFit}`
}

export function getMangaPanelTemplateProductSemantics(spec: MangaPanelTemplateSpec): string {
  return `Manga page layout template for ${spec.metadata.useCase}, optimized for ${spec.metadata.narrativeIntent.toLowerCase()}`
}

export function buildMangaPanelTemplateNarrativeBeats(spec: MangaPanelTemplateSpec): MangaPanelTemplateNarrativeBeat[] {
  const slotCount = Math.max(1, spec.metadata.panelSlotCount)

  if (slotCount === 1) {
    return [{ slot: 1, beat: 'hero reveal', purpose: 'Deliver a single dominant emotional or visual beat.' }]
  }

  if (slotCount === 2) {
    return [
      { slot: 1, beat: 'setup', purpose: 'Establish context, framing, or contrast.' },
      { slot: 2, beat: 'payoff', purpose: 'Land the reaction, reveal, or emotional answer.' },
    ]
  }

  if (slotCount === 3) {
    return [
      { slot: 1, beat: 'setup', purpose: 'Introduce the moment and visual context.' },
      { slot: 2, beat: 'escalation', purpose: 'Raise tension or deepen character focus.' },
      { slot: 3, beat: 'payoff', purpose: 'Close the mini-arc with a clear outcome.' },
    ]
  }

  if (slotCount === 4) {
    return [
      { slot: 1, beat: 'opening', purpose: 'Hook the reader into the page beat.' },
      { slot: 2, beat: 'development', purpose: 'Develop action, emotion, or dialogue.' },
      { slot: 3, beat: 'turn', purpose: 'Shift the rhythm with a reveal or reaction.' },
      { slot: 4, beat: 'payoff', purpose: 'Resolve the page beat or land the punchline.' },
    ]
  }

  if (slotCount === 5) {
    return [
      { slot: 1, beat: 'opening', purpose: 'Open with a strong framing beat.' },
      { slot: 2, beat: 'setup', purpose: 'Clarify the scene or emotional direction.' },
      { slot: 3, beat: 'escalation', purpose: 'Increase movement, pressure, or tension.' },
      { slot: 4, beat: 'reaction', purpose: 'Show consequence or character response.' },
      { slot: 5, beat: 'payoff', purpose: 'Finish on the strongest page-level note.' },
    ]
  }

  return [
    { slot: 1, beat: 'opening', purpose: 'Start the page with a readable hook.' },
    { slot: 2, beat: 'setup', purpose: 'Anchor the scene and the key actors.' },
    { slot: 3, beat: 'build', purpose: 'Advance the action or dialogue progression.' },
    { slot: 4, beat: 'turn', purpose: 'Introduce a shift, surprise, or emphasis.' },
    { slot: 5, beat: 'reaction', purpose: 'Show consequence, response, or echo.' },
    { slot: 6, beat: 'payoff', purpose: 'Close the page with a concise final beat.' },
  ].slice(0, slotCount)
}

export function getMangaPanelTemplateSpecById(id: string | null | undefined): MangaPanelTemplateSpec | null {
  if (!id) return null
  return MANGA_PANEL_TEMPLATE_SPECS.find((item) => item.id === id) || null
}
