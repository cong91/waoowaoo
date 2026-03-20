import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { PROMPT_CATALOG, PROMPT_IDS } from '@/lib/prompt-i18n'

const REQUIRED_LOCALES = ['en', 'vi', 'ko', 'zh'] as const

describe('prompt-i18n manga-webtoon catalog wiring', () => {
  it('registers dedicated manga-webtoon prompt ids in catalog', () => {
    const ids = [
      PROMPT_IDS.MW_AGENT_CLIP,
      PROMPT_IDS.MW_AGENT_STORYBOARD_PLAN,
      PROMPT_IDS.MW_PANEL_IMAGE_PROMPT,
      PROMPT_IDS.MW_IMAGE_PROMPT_MODIFY,
    ] as const

    for (const id of ids) {
      const entry = PROMPT_CATALOG[id]
      expect(entry).toBeTruthy()
      expect(entry.pathStem.startsWith('manga-webtoon/')).toBe(true)
    }
  })

  it('has template files for all required locales on manga-webtoon prompt paths', () => {
    const pathStems = [
      PROMPT_CATALOG[PROMPT_IDS.MW_AGENT_CLIP].pathStem,
      PROMPT_CATALOG[PROMPT_IDS.MW_AGENT_STORYBOARD_PLAN].pathStem,
      PROMPT_CATALOG[PROMPT_IDS.MW_PANEL_IMAGE_PROMPT].pathStem,
      PROMPT_CATALOG[PROMPT_IDS.MW_IMAGE_PROMPT_MODIFY].pathStem,
    ] as const

    for (const pathStem of pathStems) {
      for (const locale of REQUIRED_LOCALES) {
        const filePath = path.join(process.cwd(), 'lib', 'prompts', `${pathStem}.${locale}.txt`)
        expect(fs.existsSync(filePath), `missing template: ${filePath}`).toBe(true)
      }
    }
  })
})
