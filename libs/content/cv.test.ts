import { describe, it, expect } from 'vitest'
import {
  bioEntries,
  careerStartYear,
  cv,
  noBreakHyphens,
  summaryParagraphs,
  yearRange,
  YEARS_PLACEHOLDER,
  type Cv
} from './cv'
import { organisationDetails } from './organisations'

// YYYY-MM, or YYYY where the CV gives no month.
const CV_DATE = /^\d{4}(-(0[1-9]|1[0-2]))?$/

const datedEntries = [...cv.education, ...cv.experience]

describe('content/cv.json', () => {
  it('is schema version 2', () => {
    expect(cv.schemaVersion).toBe(2)
  })

  it('has a summary that mentions the years of experience', () => {
    expect(cv.summary.length).toBeGreaterThan(0)
    expect(cv.summary.join('\n')).toContain(YEARS_PLACEHOLDER)
    for (const paragraph of cv.summary) expect(paragraph.trim()).not.toBe('')
  })

  it('has skills, each with a category and items', () => {
    expect(cv.skills.length).toBeGreaterThan(0)
    for (const skill of cv.skills) {
      expect(skill.category.trim()).not.toBe('')
      expect(skill.items.length, skill.category).toBeGreaterThan(0)
      expect(new Set(skill.items).size, skill.category).toBe(skill.items.length)
    }
  })

  it('has unique skill categories', () => {
    const categories = cv.skills.map(skill => skill.category)
    expect(new Set(categories).size).toBe(categories.length)
  })

  it('has education and experience', () => {
    expect(cv.education.length).toBeGreaterThan(0)
    expect(cv.experience.length).toBeGreaterThan(0)
  })

  it('dates every entry as YYYY-MM or YYYY, ending no earlier than it starts', () => {
    for (const { start, end } of datedEntries) {
      if (start !== null) expect(start).toMatch(CV_DATE)
      if (end !== null) expect(end).toMatch(CV_DATE)
      if (start !== null && end !== null) expect(end >= start, start).toBe(true)
    }
  })

  it('gives every position a start and every degree an end', () => {
    for (const position of cv.experience) expect(position.start).not.toBeNull()
    for (const entry of cv.education) expect(entry.end).not.toBeNull()
  })

  it('lists experience most recent first', () => {
    const starts = cv.experience.map(position => position.start)
    expect(starts).toEqual([...starts].sort().reverse())
  })

  // Fails when the CV gains an organisation: add its short name and link.
  it('has website details for every organisation', () => {
    const names = [
      ...cv.education.map(entry => entry.institution),
      ...cv.experience.map(position => position.organisation)
    ]
    for (const name of names) expect(organisationDetails).toHaveProperty([name])
  })
})

// Any three organisations the site has details for; which ones doesn't
// matter, so the sample doesn't name them and survives a rename in the CV.
const [school, earlier, current] = Object.keys(organisationDetails)

const sample: Cv = {
  schemaVersion: 2,
  summary: ['Over {years} years.', 'No placeholder.'],
  skills: [],
  education: [
    {
      degree: 'BE',
      institution: school,
      location: 'Sydney',
      start: null,
      end: '2005'
    }
  ],
  experience: [
    {
      title: 'Now',
      organisation: current,
      location: 'Perth',
      start: '2022-04',
      end: null
    },
    {
      title: 'Before',
      organisation: earlier,
      location: 'Perth',
      start: '2006-06',
      end: '2022-03'
    }
  ]
}

describe('careerStartYear', () => {
  it('is the year the earliest position started', () => {
    expect(careerStartYear(sample)).toBe(2006)
  })
})

describe('summaryParagraphs', () => {
  it('fills in the years of experience', () => {
    expect(summaryParagraphs(20, sample)).toEqual([
      'Over 20 years.',
      'No placeholder.'
    ])
  })
})

describe('yearRange', () => {
  it('shows the start and end years', () => {
    expect(yearRange({ start: '2002-02', end: '2005-12' })).toBe('2002 - 2005')
  })

  it('shows present while current', () => {
    expect(yearRange({ start: '2022-04', end: null })).toBe('2022 - present')
  })

  it('takes a separator', () => {
    expect(yearRange({ start: '2006-06', end: '2022-03' }, ' – ')).toBe(
      '2006 – 2022'
    )
  })

  it('shows one year for an entry with one date', () => {
    expect(yearRange({ start: null, end: '2005' })).toBe('2005')
  })
})

describe('noBreakHyphens', () => {
  it('swaps hyphens inside words for non-breaking ones', () => {
    expect(noBreakHyphens('hands-on Non-SQL')).toBe('hands‑on Non‑SQL')
  })

  it('leaves spaced hyphens alone', () => {
    expect(noBreakHyphens('2002 - 2005')).toBe('2002 - 2005')
  })
})

describe('bioEntries', () => {
  it('lists education and positions newest first, with website details', () => {
    expect(
      bioEntries(sample).map(entry => [entry.headline, entry.organisation.name])
    ).toEqual([
      ['Now', organisationDetails[current].name],
      ['Before', organisationDetails[earlier].name],
      ['BE', organisationDetails[school].name]
    ])
  })

  it('places an entry with one date by that date', () => {
    const studiedLater: Cv = {
      ...sample,
      education: [{ ...sample.education[0], end: '2010' }]
    }
    expect(bioEntries(studiedLater).map(entry => entry.headline)).toEqual([
      'Now',
      'BE',
      'Before'
    ])
  })

  it('throws for an organisation without website details', () => {
    const unknown: Cv = {
      ...sample,
      experience: [{ ...sample.experience[0], organisation: 'Acme' }]
    }
    expect(() => bioEntries(unknown)).toThrow(/Acme/)
  })
})
