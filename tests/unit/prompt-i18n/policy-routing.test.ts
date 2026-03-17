import { describe, expect, it } from 'vitest'
import {
  buildPrompt,
  buildPromptWithPolicy,
  PROMPT_IDS,
  resolvePromptLanguageRoute,
} from '@/lib/prompt-i18n'

describe('prompt policy routing (VAT-41..45)', () => {
  it('keeps zh template/output for zh locale even on non-zh provider', () => {
    const route = resolvePromptLanguageRoute({
      promptId: PROMPT_IDS.NP_SCREENPLAY_CONVERSION,
      locale: 'zh',
      context: {
        provider: 'openai-compatible',
        modelKey: 'openai-compatible::gpt-4.1-mini',
        action: 'screenplay_conversion',
      },
    })

    expect(route.templateLocale).toBe('zh')
    expect(route.outputLocale).toBe('zh')
    expect(route.fallbackApplied).toBe(false)
  })

  it('keeps zh template for zh-capable provider on non-contract-heavy prompt', () => {
    const route = resolvePromptLanguageRoute({
      promptId: PROMPT_IDS.NP_CHARACTER_CREATE,
      locale: 'zh',
      context: {
        provider: 'qwen',
        modelKey: 'qwen::qwen-max',
        action: 'character_create',
      },
    })

    expect(route.templateLocale).toBe('zh')
    expect(route.outputLocale).toBe('zh')
    expect(route.fallbackApplied).toBe(false)
  })

  it('preserves non-zh template locale intent for vi routing while falling back to existing template files', () => {
    const route = resolvePromptLanguageRoute({
      promptId: PROMPT_IDS.NP_EPISODE_SPLIT,
      locale: 'vi',
      context: {
        provider: 'openai-compatible',
        modelKey: 'openai-compatible::gpt-4.1-mini',
        action: 'episode_split',
      },
    })

    expect(route.templateLocale).toBe('vi')
    expect(route.outputLocale).toBe('vi')
    expect(route.fallbackApplied).toBe(false)

    const prompt = buildPrompt({
      promptId: PROMPT_IDS.NP_EPISODE_SPLIT,
      locale: 'vi',
      variables: {
        CONTENT: 'Nội dung kiểm thử đủ dài để thay thế biến bắt buộc.',
      },
    })

    expect(prompt).toContain('Bạn là chuyên gia tách tập cho văn bản dài.')
  })

  it('returns telemetry with contract validity and language metadata', () => {
    const result = buildPromptWithPolicy({
      promptId: PROMPT_IDS.NP_AGENT_CLIP,
      locale: 'zh',
      variables: {
        input: 'mock input',
        locations_lib_name: 'Old Town',
        characters_lib_name: 'Hero',
        characters_introduction: 'Hero: main character',
      },
      policyContext: {
        provider: 'openai-compatible',
        modelKey: 'openai-compatible::gpt-4.1-mini',
        action: 'split_clips',
      },
      requireEnglishContract: true,
    })

    expect(result.telemetry.contract_valid).toBe(true)
    expect(result.telemetry.contract_language).toBe('en')
    expect(result.telemetry.prompt_language).toBe('zh')
    expect(result.telemetry.output_language).toBe('zh')
    expect(result.prompt).toContain('[Prompt Policy]')
    expect(result.prompt).toContain('contract_valid must remain true')
  })
})
