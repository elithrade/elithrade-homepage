// Website-only: the skill categories the home page leads with, in the order
// it shows them. The CV lists its categories in its own order and gives them
// all the same weight; the site puts these first and shows the rest after
// them, muted, in the CV's order. Keyed by the category's name exactly as the
// CV spells it. A test fails when a name here is no longer in the CV.

import { cv, type Skill } from './cv'

export const coreSkillCategories = [
  'Programming Languages',
  'Back-end',
  'Front-end',
  'Azure',
  'AWS',
  'DevOps'
]

export type SkillTiers = {
  /** The categories named above, in that order. */
  core: Skill[]
  /** Every other category, in the CV's order, so a new one still shows. */
  more: Skill[]
}

export function skillTiers(
  skills: Skill[] = cv.skills,
  coreCategories: string[] = coreSkillCategories
): SkillTiers {
  return {
    core: coreCategories.flatMap(category =>
      skills.filter(skill => skill.category === category)
    ),
    more: skills.filter(skill => !coreCategories.includes(skill.category))
  }
}
