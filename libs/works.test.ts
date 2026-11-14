import { describe, it, expect } from 'vitest'
import { cv, type Cv } from './content/cv'
import { organisationDetails } from './content/organisations'
import {
  PERSONAL_PROJECTS,
  buildWorks,
  getWork,
  groups,
  stackFor,
  works,
  worksFor
} from './works'
import { workRedirects } from './work-redirects'

describe('the works built from content/cv.json', () => {
  it('have unique, URL-safe ids', () => {
    const ids = works.map(work => work.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('each have a title, a period and at least one highlight', () => {
    expect(works.length).toBeGreaterThan(0)
    for (const work of works) {
      expect(work.title.trim(), work.id).not.toBe('')
      expect(work.period.trim(), work.id).not.toBe('')
      expect(work.highlights.length, work.id).toBeGreaterThan(0)
    }
  })

  it('each belong to a group, and every group has works', () => {
    for (const work of works) expect(groups, work.id).toContain(work.group)
    for (const group of groups) {
      expect(worksFor(group).length, group.name).toBeGreaterThan(0)
    }
  })

  it('are every work and project of the CV', () => {
    expect(works.map(work => work.id)).toEqual([
      ...cv.experience.flatMap(position => position.works.map(w => w.id)),
      ...cv.projects.map(project => project.id)
    ])
  })

  it("name only the CV's skills in their stacks, each once", () => {
    const skills = cv.skills.flatMap(skill => skill.items)
    for (const work of works) {
      expect(new Set(work.stack).size, work.id).toBe(work.stack.length)
      for (const tech of work.stack) expect(skills, work.id).toContain(tech)
    }
  })
})

describe('the redirects from old work addresses', () => {
  const ids = works.map(work => work.id)

  it('lead to works that exist', () => {
    for (const to of Object.values(workRedirects)) expect(ids).toContain(to)
  })

  it('do not shadow a work', () => {
    for (const from of Object.keys(workRedirects)) {
      expect(ids).not.toContain(from)
    }
  })
})

describe('stackFor', () => {
  const skills = [
    { category: 'Languages', items: ['TypeScript', 'C#', 'C++'] },
    { category: 'Backend', items: ['.NET', 'REST', 'SQL'] },
    { category: 'AWS', items: ['S3', 'Lambda'] }
  ]

  it('finds the skills the bullets name, in the order the CV lists them', () => {
    expect(
      stackFor(['Stored it in S3.', 'A C# service (TypeScript UI).'], skills)
    ).toEqual(['TypeScript', 'C#', 'S3'])
  })

  it('matches whole words only', () => {
    expect(stackFor(['Moved from ASP.NET pages to MySQL.'], skills)).toEqual([])
    expect(stackFor(['A .NET API with SQL.'], skills)).toEqual(['.NET', 'SQL'])
  })

  it("matches the skill's own case", () => {
    expect(stackFor(['The rest was plain sql.'], skills)).toEqual([])
  })

  it('finds a skill with symbols in its name', () => {
    expect(stackFor(['Small C++ programs.'], skills)).toEqual(['C++'])
  })

  it('lists a skill once, even when two categories have it', () => {
    const twice = [...skills, { category: 'Other', items: ['S3'] }]
    expect(stackFor(['S3 and S3.'], twice)).toEqual(['S3'])
  })
})

// Any two organisations the site has details for; which ones doesn't matter.
const [older, newer] = Object.keys(organisationDetails)

const sample: Cv = {
  schemaVersion: 3,
  summary: ['{years} years.'],
  skills: [{ category: 'Languages', items: ['TypeScript'] }],
  education: [],
  experience: [
    {
      title: 'Now',
      organisation: newer,
      location: 'Perth',
      start: '2022-04',
      end: null,
      works: [
        { id: 'card', title: 'The card', highlights: ['Led it.', 'Shipped.'] },
        { id: 'site', title: 'The site', highlights: ['In TypeScript.'] }
      ]
    },
    {
      title: 'Between',
      organisation: older,
      location: 'Perth',
      start: '2020-01',
      end: '2022-03',
      works: []
    },
    {
      title: 'Before',
      organisation: older,
      location: 'Perth',
      start: '2006-06',
      end: '2019-12',
      works: [{ id: 'suite', title: 'The suite', highlights: ['Built it.'] }]
    }
  ],
  projects: [
    {
      id: 'tool',
      name: 'Tool',
      description: 'A small tool',
      url: 'https://example.com/tool',
      start: '2026-10',
      end: null,
      highlights: ['Wrote it in TypeScript.']
    }
  ]
}

describe('buildWorks', () => {
  const built = buildWorks(sample)

  it('makes a group of each position that has works, then the projects', () => {
    expect(built.groups).toEqual([
      {
        name: organisationDetails[newer].name,
        caption: 'Now · 2022 – present'
      },
      {
        name: organisationDetails[older].name,
        caption: 'Before · 2006 – 2019'
      },
      { name: PERSONAL_PROJECTS, caption: null }
    ])
  })

  it("makes a work of each of the CV's works, in the CV's order", () => {
    expect(built.works.map(work => [work.id, work.group])).toEqual([
      ['card', built.groups[0]],
      ['site', built.groups[0]],
      ['suite', built.groups[1]],
      ['tool', built.groups[2]]
    ])
    expect(built.works[1]).toEqual({
      id: 'site',
      title: 'The site',
      group: built.groups[0],
      period: '2022 – present',
      tagline: null,
      url: null,
      highlights: ['In TypeScript.'],
      stack: ['TypeScript']
    })
  })

  it('makes a work of each project, with its description and link', () => {
    expect(built.works[3]).toEqual({
      id: 'tool',
      title: 'Tool',
      group: built.groups[2],
      period: '2026 – present',
      tagline: 'A small tool',
      url: 'https://example.com/tool',
      highlights: ['Wrote it in TypeScript.'],
      stack: ['TypeScript']
    })
  })

  it('has no projects group for a CV without projects', () => {
    const { groups } = buildWorks({ ...sample, projects: [] })
    expect(groups.map(group => group.name)).not.toContain(PERSONAL_PROJECTS)
  })
})

describe('getWork', () => {
  it('finds a work by id', () => {
    expect(getWork(works[0].id)).toBe(works[0])
  })

  it('returns undefined for an unknown id', () => {
    expect(getWork('nope')).toBeUndefined()
  })
})

describe('worksFor', () => {
  it('splits every work between the groups, in order', () => {
    expect(groups.flatMap(worksFor)).toEqual(works)
  })
})
