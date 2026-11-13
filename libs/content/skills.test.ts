import { describe, it, expect } from 'vitest'
import { cv, type Skill } from './cv'
import { coreSkillCategories, lastSkillCategories, skillTiers } from './skills'

const skill = (category: string): Skill => ({ category, items: [category] })

describe('the named skill categories', () => {
  const named = [...coreSkillCategories, ...lastSkillCategories]

  // Fails when the CV renames or drops a category the site places by name.
  it('are all categories the CV has', () => {
    const categories = cv.skills.map(skill => skill.category)
    for (const category of named) expect(categories).toContain(category)
  })

  it('are each named once', () => {
    expect(new Set(named).size).toBe(named.length)
  })
})

describe('skillTiers', () => {
  const skills = ['Tools', 'AWS', 'Languages', 'CMS', 'Back-end'].map(skill)
  const categories = (tier: Skill[]) => tier.map(s => s.category)

  it('puts the core categories first, in the order they are named', () => {
    const { core } = skillTiers(skills, ['Back-end', 'AWS'], [])
    expect(categories(core)).toEqual(['Back-end', 'AWS'])
  })

  it('keeps every other category, in the order the CV has them', () => {
    const { more } = skillTiers(skills, ['Back-end', 'AWS'], [])
    expect(categories(more)).toEqual(['Tools', 'Languages', 'CMS'])
  })

  it('moves the categories named last to the very end', () => {
    const { core, more } = skillTiers(skills, ['Back-end'], ['Tools', 'AWS'])
    expect(categories(core)).toEqual(['Back-end'])
    expect(categories(more)).toEqual(['Languages', 'CMS', 'Tools', 'AWS'])
  })

  it('skips a named category the CV does not have', () => {
    const { core, more } = skillTiers(skills, ['Rust', 'AWS'], ['Go'])
    expect(categories(core)).toEqual(['AWS'])
    expect(categories(more)).toEqual(['Tools', 'Languages', 'CMS', 'Back-end'])
  })

  it('shows every category of the CV exactly once', () => {
    const { core, more } = skillTiers()
    expect(categories([...core, ...more]).sort()).toEqual(
      categories(cv.skills).sort()
    )
  })
})
