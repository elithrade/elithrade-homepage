// Website-only: the order the home page shows the CV's skill categories in.
// The CV lists its categories in its own order and gives them all the same
// weight; the site leads with the core ones and shows the rest after them,
// muted. Keyed by the category's name exactly as the CV spells it. A test
// fails when a name here is no longer in the CV.

import { cv, type Skill } from './cv'

/** Shown first, in this order. */
export const coreSkillCategories = [
  'Back-end',
  'Front-end',
  'Azure',
  'AWS',
  'DevOps'
]

/**
 * Shown at the very end, in this order. Programming languages matter least
 * of the technical skills here: a senior developer picks one up as needed.
 * Spoken languages aren't technical, so they close the list.
 */
export const lastSkillCategories = ['Programming Languages', 'Languages']

export type SkillTiers = {
  /** The core categories, in the order they are named. */
  core: Skill[]
  /**
   * Every other category in the CV's order, so a new one still shows, then
   * the ones named to come last.
   */
  more: Skill[]
}

const pick = (skills: Skill[], categories: string[]) =>
  categories.flatMap(category =>
    skills.filter(skill => skill.category === category)
  )

export function skillTiers(
  skills: Skill[] = cv.skills,
  coreCategories: string[] = coreSkillCategories,
  lastCategories: string[] = lastSkillCategories
): SkillTiers {
  const named = [...coreCategories, ...lastCategories]
  return {
    core: pick(skills, coreCategories),
    more: [
      ...skills.filter(skill => !named.includes(skill.category)),
      ...pick(skills, lastCategories)
    ]
  }
}
