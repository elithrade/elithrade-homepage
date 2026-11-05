import { Box } from '@chakra-ui/react'
import { noBreakHyphens, type Skill } from '../libs/content/cv'

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

// A description list: the category names line up in one narrow column and
// every list of skills starts at the same edge, wrapped lines included, so
// the eye can run straight down either column. Phones have no room for two
// columns, so there the label sits above its skills. 13rem fits the
// longest bold label, Programming Languages, on one line.
export const SkillGroups = ({ skills }: { skills: Skill[] }) => (
  <Box as="dl" display="flex" flexDirection="column" gap={{ base: 3, md: 1.5 }}>
    {skills.map(skill => (
      <Box
        key={skill.category}
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: '13rem 1fr' }}
        columnGap={4}
      >
        <Box as="dt" fontWeight="bold">
          {noBreakHyphens(skill.category)}
        </Box>
        <Box as="dd">
          <SkillList items={skill.items} />
        </Box>
      </Box>
    ))}
  </Box>
)
