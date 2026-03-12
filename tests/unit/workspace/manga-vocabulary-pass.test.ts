import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

type StoryInputMangaMessages = {
  storyInput?: {
    manga?: {
      description?: string
      layout?: {
        options?: {
          cinematic?: string
        }
      }
    }
    runtimeLane?: {
      manga?: {
        videoRatio?: string
        visualStyle?: string
      }
    }
  }
}

function readLocale(locale: 'en' | 'vi'): StoryInputMangaMessages {
  const filePath = path.join(process.cwd(), 'messages', locale, 'novel-promotion.json')
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw) as StoryInputMangaMessages
}

describe('manga vocabulary pass regression (VAT-134)', () => {
  it('keeps manga lane helper text free from video-like wording in EN/VI', () => {
    for (const locale of ['en', 'vi'] as const) {
      const messages = readLocale(locale)
      const mangaDescription = messages.storyInput?.manga?.description ?? ''
      expect(mangaDescription.toLowerCase()).not.toContain('video')
      expect(mangaDescription.toLowerCase()).not.toContain('clip')
    }
  })

  it('uses panel-reading vocabulary for manga runtime lane labels', () => {
    const en = readLocale('en')
    const vi = readLocale('vi')

    expect(en.storyInput?.runtimeLane?.manga?.videoRatio).toBe('Reading Layout')
    expect(en.storyInput?.runtimeLane?.manga?.visualStyle).toBe('Line / Ink Style')

    expect(vi.storyInput?.runtimeLane?.manga?.videoRatio).toBe('Bố cục đọc')
    expect(vi.storyInput?.runtimeLane?.manga?.visualStyle).toBe('Phong cách nét / mực')
  })

  it('keeps cinematic option wording panel-first in EN/VI manga layout options', () => {
    const en = readLocale('en')
    const vi = readLocale('vi')

    expect(en.storyInput?.manga?.layout?.options?.cinematic).toBe('Dynamic Panel Flow')
    expect(vi.storyInput?.manga?.layout?.options?.cinematic).toBe('Nhịp khung động')
  })
})
