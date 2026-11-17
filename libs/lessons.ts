// What the /lessons pages show, built from the data in libs/content/.
//
// Only types come from libs/content/lessons.ts here: importing its values
// would put every project's cards in the browser bundle of each page that
// uses this module. Pages read lessonProjects in getStaticProps instead.

import { plainText } from '../components/inline-markdown'
import type {
  LessonCard,
  LessonProject,
  LessonSection,
  Lessons
} from './content/lessons'

/** Enough of a section to link to it. */
export type SectionLink = Pick<LessonSection, 'id' | 'n' | 'title'>

/** A card with the section it belongs to, for practice. */
export type CardInSection = { card: LessonCard; section: SectionLink }

/** A card as the contents page has it: the question, not the answer. */
export type QuestionOnly = Pick<LessonCard, 'id' | 'question'>

/** A project's sections and questions, without the answers. */
export type Contents = {
  project: LessonProject
  sections: (SectionLink & { cards: QuestionOnly[] })[]
}

/** A project as the /lessons page shows it. */
export type ProjectSummary = {
  project: LessonProject
  sections: number
  cards: number
}

export type SectionPage = {
  project: LessonProject
  section: LessonSection
  /** How many sections the project has. */
  total: number
  prev: SectionLink | null
  next: SectionLink | null
}

export const MIN_QUERY_LENGTH = 2

export const cardCount = (lessons: { sections: { cards: unknown[] }[] }) =>
  lessons.sections.reduce((n, s) => n + s.cards.length, 0)

export const plural = (n: number, word: string) =>
  `${n} ${word}${n === 1 ? '' : 's'}`

export const sectionHref = (projectId: string, sectionId: string) =>
  `/lessons/${projectId}/${sectionId}`

const linkTo = ({ id, n, title }: SectionLink): SectionLink => ({
  id,
  n,
  title
})

export const summaryOf = (lessons: Lessons): ProjectSummary => ({
  project: lessons.project,
  sections: lessons.sections.length,
  cards: cardCount(lessons)
})

export const contentsOf = (lessons: Lessons): Contents => ({
  project: lessons.project,
  sections: lessons.sections.map(section => ({
    ...linkTo(section),
    cards: section.cards.map(({ id, question }) => ({ id, question }))
  }))
})

export const cardsInSections = (lessons: Lessons): CardInSection[] =>
  lessons.sections.flatMap(section =>
    section.cards.map(card => ({ card, section: linkTo(section) }))
  )

export const sectionPage = (
  lessons: Lessons,
  sectionId: string
): SectionPage | undefined => {
  const { sections } = lessons
  const i = sections.findIndex(s => s.id === sectionId)
  if (i < 0) return undefined
  return {
    project: lessons.project,
    section: sections[i],
    total: sections.length,
    prev: i > 0 ? linkTo(sections[i - 1]) : null,
    next: i < sections.length - 1 ? linkTo(sections[i + 1]) : null
  }
}

/** Questions that contain the query, ignoring case and Markdown markers. */
export const searchQuestions = (contents: Contents, query: string) => {
  const q = query.trim().toLowerCase()
  if (q.length < MIN_QUERY_LENGTH) return []
  return contents.sections.flatMap(section =>
    section.cards
      .filter(card => plainText(card.question).toLowerCase().includes(q))
      .map(card => ({ card, section: linkTo(section) }))
  )
}

/** How many cards a random practice round has. */
export const RANDOM_ROUND_SIZE = 10

/** A copy of `items` in random order (Fisher-Yates). */
const shuffled = <T>(items: readonly T[], random: () => number): T[] => {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Up to `count` random cards, spread across sections: one card from each of
 * `count` random sections, so a short round covers many topics instead of
 * favouring the big sections. With fewer sections than `count`, it goes round
 * the sections again for a second card each, and so on. The round comes out
 * in random order. `random` is Math.random unless a test passes its own.
 */
export const sampleAcrossSections = (
  cards: readonly CardInSection[],
  count: number,
  random: () => number = Math.random
): CardInSection[] => {
  const bySection = new Map<string, CardInSection[]>()
  for (const c of cards) {
    bySection.set(c.section.id, [...(bySection.get(c.section.id) ?? []), c])
  }
  const queues = shuffled([...bySection.values()], random).map(group =>
    shuffled(group, random)
  )
  const picked: CardInSection[] = []
  while (picked.length < count && queues.some(q => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.pop()
      if (next) picked.push(next)
      if (picked.length === count) break
    }
  }
  return picked
}
