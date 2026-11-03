import { forwardRef, type ReactNode } from 'react'
import { Box, Spinner } from '@chakra-ui/react'

export const ArenaSpinner = () => (
  <Spinner
    size="xl"
    position="absolute"
    left="50%"
    top="50%"
    ml="calc(0px - var(--spinner-size) / 2)"
    mt="calc(0px - var(--spinner-size) / 2)"
  />
)

type ArenaContainerProps = {
  children?: ReactNode
}

// A wide strip: the arena is much wider than it is deep.
export const ArenaContainer = forwardRef<HTMLDivElement, ArenaContainerProps>(
  ({ children }, ref) => (
    <Box
      ref={ref}
      className="mini-arena"
      m="auto"
      mb={[2, 4, 6]}
      w="100%"
      maxW="640px"
      h={[200, 300, 380]}
      position="relative"
    >
      {children}
    </Box>
  )
)
ArenaContainer.displayName = 'ArenaContainer'

const Loader = () => {
  return (
    <ArenaContainer>
      <ArenaSpinner />
    </ArenaContainer>
  )
}

export default Loader
