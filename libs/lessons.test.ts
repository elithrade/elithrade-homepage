import { describe, it, expect } from 'vitest'
import {
  cardCount,
  cardsInSections,
  contentsOf,
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
