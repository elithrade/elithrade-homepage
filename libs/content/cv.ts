// The CV content the site shows, from content/cv.json (see content/README.md).
// Typing the import as Cv makes `next build` (and `npm run typecheck`) reject
// a cv.json of the wrong shape; cv.test.ts checks what types can't.

import cvJson from '../../content/cv.json'
import { detailsFor, type OrganisationDetails } from './organisations'

/** A month as `YYYY-MM`, or a year alone as `YYYY` where the CV gives no month. */
export type CvDate = string

export type Skill = {
  category: string
  items: string[]
}

export type Education = {
  degree: string
  institution: string
  location: string
  /** null when the CV gives one date, the year the degree was completed. */
  start: CvDate | null
  end: CvDate
}

/** A group of the CV's bullets about one piece of work, shown at /works/<id>. */
export type CvWork = {
  id: string
  title: string
  /** The CV's bullets, word for word. */
  highlights: string[]
}

export type Position = {
  title: string
  organisation: string
  location: string
  start: CvDate
  /** null while the position is current. */
  end: CvDate | null
  /** The bullets the CV marks as works; a position may have none. */
  works: CvWork[]
}

/** A personal project, shown at /works/<id> like a work. */
export type Project = {
  id: string
  name: string
  /** One line saying what it is. */
  description: string
  url: string
  start: CvDate
  /** null while the project is current. */
  end: CvDate | null
  highlights: string[]
}

export type Cv = {
  schemaVersion: number
  /** Paragraphs; `{years}` stands for the years of experience. */
  summary: string[]
  skills: Skill[]
  education: Education[]
  /** Most recent first, as in the CV. */
  experience: Position[]
  projects: Project[]
}

export const cv: Cv = cvJson

export const YEARS_PLACEHOLDER = '{years}'

const yearOf = (date: CvDate) => Number(date.slice(0, 4))

/** The year the earliest position started, which experience counts from. */
export const careerStartYear = (data: Cv = cv) =>
  Math.min(...data.experience.map(position => yearOf(position.start)))

export const summaryParagraphs = (years: number, data: Cv = cv) =>
  data.summary.map(paragraph =>
    paragraph.replaceAll(YEARS_PLACEHOLDER, String(years))
  )

/** `2006 - 2022`, `2022 - present` while current, or `2005` for one date. */
export const yearRange = (
  { start, end }: { start: CvDate | null; end: CvDate | null },
  separator = ' - '
) => {
  const to = end === null ? 'present' : yearOf(end)
  return start === null ? String(to) : `${yearOf(start)}${separator}${to}`
}

// U+2011, a hyphen that never breaks the line, so "hands-on" or "Non-SQL"
// isn't split across two lines.
const NON_BREAKING_HYPHEN = '‑'

/** Swaps hyphens inside words for non-breaking ones. */
export const noBreakHyphens = (text: string) =>
  text.replace(/(?<=\w)-(?=\w)/g, NON_BREAKING_HYPHEN)

export type BioEntry = {
  key: string
  /** null for an entry with one date, which is then its `end`. */
  start: CvDate | null
  end: CvDate | null
  /** The degree or job title. */
  headline: string
  organisation: OrganisationDetails
}

// An entry with one date is placed by that date.
const sortDate = ({ start, end }: BioEntry) => start ?? end ?? ''
const latestFirst = (a: BioEntry, b: BioEntry) =>
  sortDate(b).localeCompare(sortDate(a))

/** Education and positions together, newest first, as on a CV. */
export const bioEntries = (data: Cv = cv): BioEntry[] =>
  [
    ...data.education.map(entry => ({
      key: `${entry.institution}:${entry.end}`,
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
  ].sort(latestFirst)
