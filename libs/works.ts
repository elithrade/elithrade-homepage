// The works shown on /works, built from content/cv.json: under each position,
// the bullets the CV groups into works, then the CV's personal projects.
// Nothing here is written by hand. To change a work, change the CV
// (github.com/elithrade/My-Awesome-CV, examples/resume/experience.tex and
// projects.tex); its CI then opens a pull request here.

import { cv, yearRange, type Cv, type Skill } from './content/cv'
import { detailsFor } from './content/organisations'

/** A section of /works: an organisation, or the personal projects. */
export type WorkGroup = {
  name: string
  /** Shown under the name: the role and years at an organisation. */
  caption: string | null
}

export type Work = {
  /** URL slug: /works/<id> */
  id: string
  title: string
  group: WorkGroup
  /** The years of the position the work was part of, or of the project. */
  period: string
  /** A project's one-line description; null for a work at an organisation. */
  tagline: string | null
  /** A project's link; null for a work at an organisation. */
  url: string | null
  /** The CV's bullets, word for word. */
  highlights: string[]
  /** The CV's skills that the bullets name; may be empty. */
  stack: string[]
}

export const PERSONAL_PROJECTS = 'Personal projects'

const PERIOD_SEPARATOR = ' – '

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// As a whole word, in the skill's own case: "REST" is not found in "rest",
// nor ".NET" in "ASP.NET".
const names = (text: string, skill: string) =>
  new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(skill)}(?![A-Za-z0-9])`).test(text)

/** The skills the bullets name, in the order the CV lists its skills. */
export function stackFor(highlights: string[], skills: Skill[]): string[] {
  const text = highlights.join('\n')
  const items = skills.flatMap(skill => skill.items)
  return [...new Set(items)].filter(item => names(text, item))
}

export function buildWorks(data: Cv = cv): {
  groups: WorkGroup[]
  works: Work[]
} {
  const groups: WorkGroup[] = []
  const works: Work[] = []

  for (const position of data.experience) {
    if (position.works.length === 0) continue
    const period = yearRange(position, PERIOD_SEPARATOR)
    const group: WorkGroup = {
      name: detailsFor(position.organisation).name,
      caption: `${position.title} · ${period}`
    }
    groups.push(group)
    for (const { id, title, highlights } of position.works) {
      works.push({
        id,
        title,
        group,
        period,
        tagline: null,
        url: null,
        highlights,
        stack: stackFor(highlights, data.skills)
      })
    }
  }

  if (data.projects.length > 0) {
    const group: WorkGroup = { name: PERSONAL_PROJECTS, caption: null }
    groups.push(group)
    for (const project of data.projects) {
      works.push({
        id: project.id,
        title: project.name,
        group,
        period: yearRange(project, PERIOD_SEPARATOR),
        tagline: project.description,
        url: project.url,
        highlights: project.highlights,
        stack: stackFor(project.highlights, data.skills)
      })
    }
  }

  return { groups, works }
}

export const { groups, works } = buildWorks()

export function getWork(id: string): Work | undefined {
  return works.find(work => work.id === id)
}

export function worksFor(group: WorkGroup): Work[] {
  return works.filter(work => work.group === group)
}
