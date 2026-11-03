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

// The width of the main column, with a fixed aspect ratio so the scene just
// scales up or down with the page: the camera always shows the same view.
export const ARENA_ASPECT_RATIO = '640 / 380'

export const ArenaContainer = forwardRef<HTMLDivElement, ArenaContainerProps>(
  ({ children }, ref) => (
    <Box
      ref={ref}
      className="mini-arena"
      mb={[2, 4, 6]}
      w="100%"
      sx={{ aspectRatio: ARENA_ASPECT_RATIO }}
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
