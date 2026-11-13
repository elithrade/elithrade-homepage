import { Box } from '@chakra-ui/react'
import { noBreakHyphens, type Skill } from '../libs/content/cv'
import { skillTiers } from '../libs/content/skills'
import { TermList, TermRow } from './term-list'

// The room a separator dot takes between two skills, as a Chakra space token
// (1.25rem). The list is pulled left by the same amount.
const SEPARATOR = 5

// Plain text in the same voice as the Bio: bold labels and a faint dot
// between skills, light enough to pick out each skill without boxing it.
// The dot leads its skill, so a line never ends with one. Every line's first
// skill has a dot too: the list is pulled left by the dot's width and the
// wrapper clips it, which leaves dots only between skills on the same line.
// A skill only wraps inside itself when it is wider than the whole line; each
// skill is a flex row so that its wrapped lines start beside the dot, inside
// the visible area, and not under it.
const SkillList = ({ items }: { items: string[] }) => (
  <Box overflow="hidden">
    <Box
      as="ul"
      listStyleType="none"
      display="flex"
      flexWrap="wrap"
      ml={-SEPARATOR}
      sx={{
        '& > li': { display: 'flex' },
        '& > li::before': {
          content: '"·"',
          flexShrink: 0,
          w: SEPARATOR,
          textAlign: 'center',
          opacity: 0.7
        }
      }}
    >
      {items.map(item => (
        <li key={item}>{noBreakHyphens(item)}</li>
      ))}
    </Box>
  </Box>
)

const SkillTier = ({ skills }: { skills: Skill[] }) => (
  <TermList>
    {skills.map(skill => (
      <TermRow key={skill.category} term={noBreakHyphens(skill.category)}>
        <SkillList items={skill.items} />
      </TermRow>
    ))}
  </TermList>
)

// Two tiers: the categories the site leads with (libs/content/skills.ts),
// then the rest after a wider gap and in muted text, so the eye lands on the
// first tier and the second reads as supporting detail.
export const SkillGroups = ({ skills }: { skills: Skill[] }) => {
  const { core, more } = skillTiers(skills)
  return (
    <Box display="flex" flexDirection="column" gap={6}>
      {core.length > 0 && <SkillTier skills={core} />}
      {more.length > 0 && (
        <Box color="text-muted">
          <SkillTier skills={more} />
        </Box>
      )}
    </Box>
  )
}
