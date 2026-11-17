// Turns a project's LESSONS.md into the Lessons data the site shows. Run by
// scripts/export-lessons.mjs; content/README.md describes the format.
//
// The format is strict on purpose: a line the exporter doesn't understand is
// an error with its line number, so a card can't silently go missing or
// render as broken Markdown on the site.

import type {
  LessonCard,
  LessonProject,
  LessonSection,
  Lessons
} from './lessons'

export class LessonsFormatError extends Error {}

const SLUG_MAX = 60

/** Lowercase letters and digits joined by single dashes, at most 60 long. */
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX)
    .replace(/-+$/, '')

const SECTION = /^## (\d+)\. (.+)$/
const SUMMARY = /^<details><summary>(.+)<\/summary>$/
// Markdown the site's card renderer doesn't handle: lists, quotes, tables,
// code blocks and links. Only `code` and **bold** are rendered.
const UNSUPPORTED = /^\s*([-*+]\s|\d+\.\s|>|\||```|~~~)|\[[^\]]*\]\([^)]*\)/

const ENTITIES: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&amp;': '&'
}

/** A summary's HTML as Markdown: `<code>` becomes backticks. */
const summaryToMarkdown = (html: string) =>
  html
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    .replace(/&(lt|gt|quot|#39|amp);/g, entity => ENTITIES[entity])

type OpenSection = LessonSection & { line: number }
type OpenCard = { question: string; line: number; paragraphs: string[][] }

const joinParagraphs = (paragraphs: string[][]) =>
  paragraphs.filter(p => p.length > 0).map(p => p.join(' '))

export const exportLessons = (
  markdown: string,
  project: LessonProject
): Lessons => {
  const sections: LessonSection[] = []
  const sectionLines = new Map<string, number>()
  const cardLines = new Map<string, number>()
  let section: OpenSection | null = null
  let card: OpenCard | null = null
  let intro: string[][] = [[]]

  const fail = (line: number, message: string): never => {
    throw new LessonsFormatError(`LESSONS.md line ${line}: ${message}`)
  }

  const checkSupported = (text: string, line: number) => {
    if (UNSUPPORTED.test(text)) {
      fail(
        line,
        'lists, quotes, tables, code blocks and links are not supported in cards; use paragraphs, `code` and **bold**'
      )
    }
  }

  const closeSection = () => {
    if (section === null) return
    if (section.cards.length === 0) {
      fail(section.line, `section "${section.title}" has no cards`)
    }
    const { line: _line, ...done } = section
    sections.push({ ...done, intro: joinParagraphs(intro) })
  }

  const lines = markdown.split(/\r?\n/)
  lines.forEach((text, index) => {
    const line = index + 1

    if (card !== null) {
      if (text === '</details>') {
        const answer = joinParagraphs(card.paragraphs)
        if (answer.length === 0) fail(line, 'the card has no answer')
        const id = slugify(card.question)
        const seen = cardLines.get(id)
        if (seen !== undefined) {
          fail(
            card.line,
            `this question has the same id ("${id}") as the one on line ${seen}; reword one of them`
          )
        }
        cardLines.set(id, card.line)
        const done: LessonCard = { id, question: card.question, answer }
        section?.cards.push(done)
        card = null
      } else if (text.startsWith('## ') || text.startsWith('<details')) {
        fail(
          line,
          `the card on line ${card.line} is not closed with </details>`
        )
      } else if (text.trim() === '') {
        card.paragraphs.push([])
      } else {
        checkSupported(text, line)
        card.paragraphs[card.paragraphs.length - 1].push(text.trim())
      }
      return
    }

    if (text.startsWith('## ')) {
      const match = SECTION.exec(text)
      if (match === null) {
        return fail(
          line,
          'a section heading must be numbered, like "## 1. Title"'
        )
      }
      closeSection()
      const title = match[2].trim()
      const id = slugify(title.replace(/`/g, ''))
      const seen = sectionLines.get(id)
      if (seen !== undefined) {
        fail(
          line,
          `this section has the same id ("${id}") as the one on line ${seen}`
        )
      }
      sectionLines.set(id, line)
      section = { n: Number(match[1]), id, title, intro: [], cards: [], line }
      intro = [[]]
    } else if (text.startsWith('<details')) {
      const match = SUMMARY.exec(text)
      if (match === null) {
        return fail(
          line,
          'a card must start with <details><summary>question</summary> on one line'
        )
      }
      if (section === null) {
        return fail(line, 'a card before the first section heading')
      }
      card = { question: summaryToMarkdown(match[1]), line, paragraphs: [[]] }
    } else if (text === '</details>') {
      fail(line, '</details> without a card to close')
    } else if (section === null) {
      // The file's title and introduction: not exported.
    } else if (text.trim() === '') {
      intro.push([])
    } else if (section.cards.length > 0) {
      fail(
        line,
        "text after a section's cards; move it into a card or above the first card"
      )
    } else {
      checkSupported(text, line)
      intro[intro.length - 1].push(text.trim())
    }
  })

  if (card !== null) {
    fail((card as OpenCard).line, 'the card is not closed with </details>')
  }
  closeSection()

  return { schemaVersion: 1, project, sections }
}
