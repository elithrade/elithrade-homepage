import { Box, Button, useColorModeValue } from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import { CV_URL } from '../libs/cv'

// Uses the theme toggle's colour schemes, so the accent matches it in both
// modes: purple.500 with white text in light mode (4.8:1), orange.200 with
// dark text in dark mode (11.5:1).
const DownloadCvButton = () => (
  <Box textAlign="center" my={4}>
    <Button
      as="a"
      href={CV_URL}
      leftIcon={<DownloadIcon />}
      colorScheme={useColorModeValue('purple', 'orange')}
    >
      Download CV
    </Button>
  </Box>
)

export default DownloadCvButton
