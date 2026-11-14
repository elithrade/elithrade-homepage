import type { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

// The home page's two-column lists (Bio and Technical Skills) share one
// label column, so the years and the skill categories line up down the
// page and every entry starts at the same edge, wrapped lines included.
// 13rem keeps a bold label of about twenty characters on one line.
// Phones have no room for two columns, so there the label sits above its
// entry. The gap between rows is half a line: enough for an entry that wraps
// onto a second line to still read as one row.
export const TermList = ({ children }: { children: ReactNode }) => (
  <Box as="dl" display="flex" flexDirection="column" gap={3}>
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
