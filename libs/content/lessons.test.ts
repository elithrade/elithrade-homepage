import { describe, it, expect } from 'vitest'
import { lessonProjects } from './lessons'

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

describe.each(lessonProjects.map(l => [l.project.id, l] as const))(
  'content/lessons/%s.json',
  (_, lessons) => {
    it('is schema version 1', () => {
      expect(lessons.schemaVersion).toBe(1)
    })

    it('links to its source', () => {
      expect(lessons.project.source).toMatch(/^https:\/\//)
    })

    it('numbers its sections from 1 without gaps', () => {
      expect(lessons.sections.map(s => s.n)).toEqual(
        lessons.sections.map((_, i) => i + 1)
      )
    })

    it('has cards with a question and an answer in every section', () => {
      for (const section of lessons.sections) {
        expect(section.cards.length).toBeGreaterThan(0)
        for (const card of section.cards) {
          expect(card.question).not.toBe('')
          expect(card.answer.length).toBeGreaterThan(0)
        }
      }
    })

    it('has ids that are usable in addresses and unique', () => {
      const sectionIds = lessons.sections.map(s => s.id)
      const cardIds = lessons.sections.flatMap(s => s.cards.map(c => c.id))
      for (const id of [...sectionIds, ...cardIds]) expect(id).toMatch(SLUG)
      expect(new Set(sectionIds).size).toBe(sectionIds.length)
      expect(new Set(cardIds).size).toBe(cardIds.length)
    })
  }
)

describe('lessonProjects', () => {
  it('has unique project ids', () => {
    const ids = lessonProjects.map(l => l.project.id)
    for (const id of ids) expect(id).toMatch(SLUG)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
