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

// A fixed aspect ratio, so the scene just scales up or down with the page:
// the camera always shows the same view. It fills the main column on narrow
// screens but stops at SCENE_MAX_WIDTH, so it sets the mood without pulling
// attention from the content below.
export const SCENE_ASPECT_RATIO = '640 / 380'
export const SCENE_MAX_WIDTH = '380px'

export const SceneContainer = forwardRef<HTMLDivElement, SceneContainerProps>(
  ({ children }, ref) => (
    <Box
      ref={ref}
      className="hero-scene"
      mx="auto"
      mb={[2, 4, 6]}
      w="100%"
      maxW={SCENE_MAX_WIDTH}
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
