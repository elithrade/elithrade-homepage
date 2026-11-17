import { describe, it, expect } from 'vitest'
import {
  cardCount,
  cardsInSections,
  contentsOf,
  sampleAcrossSections,
  searchQuestions,
  sectionPage,
  summaryOf
} from './lessons'
import type { Lessons } from './content/lessons'

const card = (id: string, question: string, answer: string) => ({
  id,
  question,
  answer: [answer]
})

const lessons: Lessons = {
  schemaVersion: 1,
  project: {
    id: 'demo',
    name: 'demo',
    description: 'Demo.',
    source: 'https://x.dev'
  },
  sections: [
    {
      n: 1,
      id: 'redis',
      title: 'Redis',
      intro: [],
      cards: [
        card('set-nx', 'What does `SET NX` do?', 'Sets a key if **missing**.'),
        card('ttl', 'What is a TTL?', 'Time to live.')
      ]
    },
    {
      n: 2,
      id: 'postgres',
      title: 'Postgres',
      intro: [],
      cards: [card('mvcc', 'What is MVCC?', 'Row versions stay until vacuum.')]
    },
    {
      n: 3,
      id: 'testing',
      title: 'Testing',
      intro: [],
      cards: [card('gate', 'Why hold calls at a gate?', 'To control timing.')]
    }
  ]
}

describe('cardCount and summaryOf', () => {
  it('count the cards of every section', () => {
    expect(cardCount(lessons)).toBe(4)
    expect(summaryOf(lessons)).toEqual({
      project: lessons.project,
      sections: 3,
      cards: 4
    })
  })
})

describe('contentsOf', () => {
  it('keeps the questions and drops the answers and intros', () => {
    const contents = contentsOf(lessons)
    expect(contents.sections[1]).toEqual({
      id: 'postgres',
      n: 2,
      title: 'Postgres',
      cards: [{ id: 'mvcc', question: 'What is MVCC?' }]
    })
  })
})

describe('cardsInSections', () => {
  it('lists every card with its section, in order', () => {
    expect(
      cardsInSections(lessons).map(c => `${c.section.id}/${c.card.id}`)
    ).toEqual(['redis/set-nx', 'redis/ttl', 'postgres/mvcc', 'testing/gate'])
  })
})

describe('sampleAcrossSections', () => {
  // A small seeded generator (mulberry32), so each trial is repeatable.
  const seeded = (seed: number) => () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const all = cardsInSections(lessons) // redis: 2 cards, postgres: 1, testing: 1
  const ids = (cards: { card: { id: string } }[]) => cards.map(c => c.card.id)
  const sectionsOf = (cards: { section: { id: string } }[]) =>
    cards.map(c => c.section.id)

  it('takes each card from a different section while sections last', () => {
    for (let seed = 1; seed <= 50; seed++) {
      for (const count of [1, 2, 3]) {
        const round = sampleAcrossSections(all, count, seeded(seed))
        expect(round).toHaveLength(count)
        expect(new Set(sectionsOf(round)).size).toBe(count)
      }
    }
  })

  it('goes round the sections again when there are fewer than asked for', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const round = sampleAcrossSections(all, 4, seeded(seed))
      expect(new Set(ids(round))).toEqual(new Set(ids(all)))
    }
  })

  it('never repeats a card, even when asked for more than there are', () => {
    const round = sampleAcrossSections(all, 10, seeded(7))
    expect(round).toHaveLength(all.length)
    expect(new Set(ids(round)).size).toBe(all.length)
  })

  it('picks different cards from run to run', () => {
    const rounds = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8].map(seed =>
        ids(sampleAcrossSections(all, 2, seeded(seed))).join()
      )
    )
    expect(rounds.size).toBeGreaterThan(1)
  })

  it('returns nothing for no cards', () => {
    expect(sampleAcrossSections([], 10)).toEqual([])
  })
})

describe('searchQuestions', () => {
  const contents = contentsOf(lessons)
  const ids = (query: string) =>
    searchQuestions(contents, query).map(h => h.card.id)

  it('matches questions, ignoring case', () => {
    expect(ids('ttl')).toEqual(['ttl'])
    expect(ids('MVCC')).toEqual(['mvcc'])
  })

  it('matches text across the Markdown markers', () => {
    expect(ids('set nx do')).toEqual(['set-nx'])
  })

  it('names the section of each hit', () => {
    expect(searchQuestions(contents, 'mvcc')[0].section).toEqual({
      id: 'postgres',
      n: 2,
      title: 'Postgres'
    })
  })

  it('ignores a query shorter than two characters', () => {
    expect(ids(' t ')).toEqual([])
  })
})

describe('sectionPage', () => {
  it('links a middle section to the sections around it', () => {
    const page = sectionPage(lessons, 'postgres')
    expect(page?.section.id).toBe('postgres')
    expect(page?.total).toBe(3)
    expect(page?.prev).toEqual({ id: 'redis', n: 1, title: 'Redis' })
    expect(page?.next).toEqual({ id: 'testing', n: 3, title: 'Testing' })
  })

  it('has no previous section for the first and no next for the last', () => {
    expect(sectionPage(lessons, 'redis')?.prev).toBeNull()
    expect(sectionPage(lessons, 'testing')?.next).toBeNull()
  })

  it('is undefined for an unknown section', () => {
    expect(sectionPage(lessons, 'nope')).toBeUndefined()
  })
})
