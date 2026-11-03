import { forwardRef, type ReactNode } from 'react'
import { Box, Spinner } from '@chakra-ui/react'

export const SceneSpinner = () => (
  <Spinner
    size="xl"
    position="absolute"
    left="50%"
    top="50%"
    ml="calc(0px - var(--spinner-size) / 2)"
    mt="calc(0px - var(--spinner-size) / 2)"
  />
)

type SceneContainerProps = {
  children?: ReactNode
}

// The width of the main column, with a fixed aspect ratio so the scene just
// scales up or down with the page: the camera always shows the same view.
export const SCENE_ASPECT_RATIO = '640 / 380'

export const SceneContainer = forwardRef<HTMLDivElement, SceneContainerProps>(
  ({ children }, ref) => (
    <Box
      ref={ref}
      className="hero-scene"
      mb={[2, 4, 6]}
      w="100%"
      sx={{ aspectRatio: SCENE_ASPECT_RATIO }}
      position="relative"
    >
      {children}
    </Box>
  )
)
SceneContainer.displayName = 'SceneContainer'

const Loader = () => {
  return (
    <SceneContainer>
      <SceneSpinner />
    </SceneContainer>
  )
}

export default Loader
