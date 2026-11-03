import { forwardRef, type ReactNode } from 'react'
import { Box, Spinner } from '@chakra-ui/react'

export const PetsSpinner = () => (
  <Spinner
    size="xl"
    position="absolute"
    left="50%"
    top="50%"
    ml="calc(0px - var(--spinner-size) / 2)"
    mt="calc(0px - var(--spinner-size) / 2)"
  />
)

type PetsContainerProps = {
  children?: ReactNode
}

// A wide strip: the pets stand in a row, so the scene is much wider than tall.
export const PetsContainer = forwardRef<HTMLDivElement, PetsContainerProps>(
  ({ children }, ref) => (
    <Box
      ref={ref}
      className="cube-pets"
      m="auto"
      mb={[2, 4, 6]}
      w="100%"
      maxW="640px"
      h={[150, 220, 280]}
      position="relative"
    >
      {children}
    </Box>
  )
)
PetsContainer.displayName = 'PetsContainer'

const Loader = () => {
  return (
    <PetsContainer>
      <PetsSpinner />
    </PetsContainer>
  )
}

export default Loader
