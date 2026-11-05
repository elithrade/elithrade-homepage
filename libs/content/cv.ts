// The CV content the site shows, from content/cv.json (see content/README.md).
// Typing the import as Cv makes `next build` (and `npm run typecheck`) reject
// a cv.json of the wrong shape; cv.test.ts checks what types can't.

import cvJson from '../../content/cv.json'
import { detailsFor, type OrganisationDetails } from './organisations'

/** A month as `YYYY-MM`. */
export type YearMonth = string

export type Skill = {
  category: string
  items: string[]
}

export type Education = {
  degree: string
  institution: string
  location: string
  start: YearMonth
  end: YearMonth | null
}

export type Position = {
  title: string
  organisation: string
  location: string
  start: YearMonth
  /** null while the position is current. */
  end: YearMonth | null
}

export type Cv = {
  schemaVersion: number
  /** Paragraphs; `{years}` stands for the years of experience. */
  summary: string[]
  skills: Skill[]
  education: Education[]
  /** Most recent first, as in the CV. */
  experience: Position[]
}

export const cv: Cv = cvJson

export const YEARS_PLACEHOLDER = '{years}'

const yearOf = (month: YearMonth) => Number(month.slice(0, 4))

/** The year the earliest position started, which experience counts from. */
export const careerStartYear = (data: Cv = cv) =>
  Math.min(...data.experience.map(position => yearOf(position.start)))

export const summaryParagraphs = (years: number, data: Cv = cv) =>
  data.summary.map(paragraph =>
    paragraph.replaceAll(YEARS_PLACEHOLDER, String(years))
  )

/** `2002 - 2005`, or `2022 - present` while current. */
export const yearRange = (
  { start, end }: { start: YearMonth; end: YearMonth | null },
  separator = ' - '
) => `${yearOf(start)}${separator}${end ? yearOf(end) : 'present'}`

// U+2011, a hyphen that never breaks the line, so "hands-on" or "Non-SQL"
// isn't split across two lines.
const NON_BREAKING_HYPHEN = '‑'

/** Swaps hyphens inside words for non-breaking ones. */
export const noBreakHyphens = (text: string) =>
  text.replace(/(?<=\w)-(?=\w)/g, NON_BREAKING_HYPHEN)

export type BioEntry = {
  key: string
  start: YearMonth
  end: YearMonth | null
  /** The degree or job title. */
  headline: string
  organisation: OrganisationDetails
}

/** Education and positions together, oldest first. */
export const bioEntries = (data: Cv = cv): BioEntry[] =>
  [
    ...data.education.map(entry => ({
      key: `${entry.institution}:${entry.start}`,
      start: entry.start,
      end: entry.end,
      headline: entry.degree,
      organisation: detailsFor(entry.institution)
    })),
    ...data.experience.map(position => ({
      key: `${position.organisation}:${position.start}`,
      start: position.start,
      end: position.end,
      headline: position.title,
      organisation: detailsFor(position.organisation)
    }))
  ].sort((a, b) => a.start.localeCompare(b.start))
