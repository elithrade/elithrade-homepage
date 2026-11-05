import type { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

// The home page's two-column lists (Bio and Technical Skills) share one
// label column, so the years and the skill categories line up down the
// page and every entry starts at the same edge, wrapped lines included.
// 13rem fits the longest bold label, Programming Languages, on one line.
// Phones have no room for two columns, so there the label sits above its
// entry.
export const TermList = ({ children }: { children: ReactNode }) => (
  <Box as="dl" display="flex" flexDirection="column" gap={{ base: 3, md: 1.5 }}>
    {children}
  </Box>
)

export const TermRow = ({
  term,
  children
}: {
  term: ReactNode
  children: ReactNode
}) => (
  <Box
    display="grid"
    gridTemplateColumns={{ base: '1fr', md: '13rem 1fr' }}
    columnGap={4}
  >
    <Box as="dt" fontWeight="bold">
      {term}
    </Box>
    <Box as="dd">{children}</Box>
  </Box>
)
