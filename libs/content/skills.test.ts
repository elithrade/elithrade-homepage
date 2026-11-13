import { describe, it, expect } from 'vitest'
import { cv, type Skill } from './cv'
import { coreSkillCategories, skillTiers } from './skills'

const skill = (category: string): Skill => ({ category, items: [category] })

describe('coreSkillCategories', () => {
  // Fails when the CV renames or drops a category the site leads with.
  it('names only categories the CV has', () => {
    const categories = cv.skills.map(skill => skill.category)
    for (const category of coreSkillCategories) {
      expect(categories).toContain(category)
    }
  })

  it('names each category once', () => {
    expect(new Set(coreSkillCategories).size).toBe(coreSkillCategories.length)
  })
})

describe('skillTiers', () => {
  const skills = ['Tools', 'AWS', 'CMS', 'Back-end'].map(skill)

  it('puts the core categories first, in the order they are named', () => {
    const { core } = skillTiers(skills, ['Back-end', 'AWS'])
    expect(core.map(s => s.category)).toEqual(['Back-end', 'AWS'])
  })

  it('keeps every other category, in the order the CV has them', () => {
    const { more } = skillTiers(skills, ['Back-end', 'AWS'])
    expect(more.map(s => s.category)).toEqual(['Tools', 'CMS'])
  })

  it('skips a core category the CV does not have', () => {
    const { core, more } = skillTiers(skills, ['Rust', 'AWS'])
    expect(core.map(s => s.category)).toEqual(['AWS'])
    expect(more.map(s => s.category)).toEqual(['Tools', 'CMS', 'Back-end'])
  })

  it('shows every category of the CV exactly once', () => {
    const { core, more } = skillTiers()
    const shown = [...core, ...more].map(s => s.category)
    expect([...shown].sort()).toEqual(cv.skills.map(s => s.category).sort())
  })
})
