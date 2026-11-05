import { Box } from '@chakra-ui/react'
import { noBreakHyphens, type Skill } from '../libs/content/cv'

// Every chip is at least 28px tall. On wide screens each label is padded
// down by LABEL_OFFSET so its first line sits level with the text of the
// first row of chips beside it, even when a long label wraps.
const CHIP_HEIGHT = '28px'
const LABEL_OFFSET = '6px'

const SkillChip = ({ children }: { children: string }) => (
  <Box
    as="li"
    fontSize="sm"
    lineHeight="20px"
    px={2.5}
    py="3px"
    minH={CHIP_HEIGHT}
    borderRadius="md"
    borderWidth="1px"
    borderColor="surface-border"
    bg="surface"
  >
    {noBreakHyphens(children)}
  </Box>
)

// A description list: the category names line up in one narrow column so
// the eye can run down them, and each category's skills start at the same
// edge as chips. Phones have no room for two columns, so there the label
// sits above its chips. The gap between categories is wider than the gap
// between wrapped rows of chips, so a long list still reads as one group.
export const SkillGroups = ({ skills }: { skills: Skill[] }) => (
  <Box as="dl" display="flex" flexDirection="column" gap={{ base: 5, md: 4 }}>
    {skills.map(skill => (
      <Box
        key={skill.category}
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: '11rem 1fr' }}
        columnGap={4}
        rowGap={1.5}
      >
        <Box
          as="dt"
          fontSize="xs"
          fontWeight={600}
          textTransform="uppercase"
          letterSpacing="wider"
          color="text-muted"
          lineHeight="short"
          pt={{ md: LABEL_OFFSET }}
        >
          {noBreakHyphens(skill.category)}
        </Box>
        <Box as="dd">
          <Box
            as="ul"
            listStyleType="none"
            display="flex"
            flexWrap="wrap"
            gap={2}
          >
            {skill.items.map(item => (
              <SkillChip key={item}>{item}</SkillChip>
            ))}
          </Box>
        </Box>
      </Box>
    ))}
  </Box>
)
