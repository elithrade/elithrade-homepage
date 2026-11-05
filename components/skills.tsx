import { Box } from '@chakra-ui/react'
import { noBreakHyphens, type Skill } from '../libs/content/cv'
import { TermList, TermRow } from './term-list'

// Plain text in the same voice as the Bio: bold labels and a muted dot
// between skills, light enough to pick out each skill without boxing it.
// The dot trails its skill, so a wrapped line never starts with one, and a
// skill only wraps inside itself when it is wider than the whole line.
const SkillList = ({ items }: { items: string[] }) => (
  <Box
    as="ul"
    listStyleType="none"
    display="flex"
    flexWrap="wrap"
    sx={{
      '& > li:not(:last-of-type)::after': {
        content: '"·"',
        color: 'text-muted',
        mx: 2
      }
    }}
  >
    {items.map(item => (
      <li key={item}>{noBreakHyphens(item)}</li>
    ))}
  </Box>
)

export const SkillGroups = ({ skills }: { skills: Skill[] }) => (
  <TermList>
    {skills.map(skill => (
      <TermRow key={skill.category} term={noBreakHyphens(skill.category)}>
        <SkillList items={skill.items} />
      </TermRow>
    ))}
  </TermList>
)
