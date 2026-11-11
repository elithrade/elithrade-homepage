import { forwardRef, type ReactNode } from 'react'
import { Box, Spinner } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

const appear = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

// Centred over the scene. It fades in after a moment, so a load that's over
// quickly (switching to a scene whose models are cached) doesn't flash it,
// and it lets clicks through to the scene underneath.
export const SceneSpinner = () => (
  <Box
    position="absolute"
    inset={0}
    display="flex"
    alignItems="center"
    justifyContent="center"
    pointerEvents="none"
    animation={`${appear} 0.2s ease-out 0.3s both`}
  >
    <Spinner size="xl" />
  </Box>
)

type SceneContainerProps = {
  children?: ReactNode
}

// A fixed aspect ratio, so the scene just scales up or down with the page:
// the camera always shows the same view. It fills the main column on narrow
// screens but stops at SCENE_MAX_WIDTH, so it sets the mood without pulling
// attention from the content below.
export const SCENE_ASPECT_RATIO = '640 / 380'
export const SCENE_MAX_WIDTH = '640px'

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
