import { Button, useColorModeValue, type ButtonProps } from '@chakra-ui/react'

// The main action uses the theme toggle's colour schemes, like the Download
// CV button: purple.500 in light mode, orange.200 in dark. The other actions
// are outlined on the surface colour, like the hero's scene switch.
export const PrimaryButton = (props: ButtonProps) => (
  <Button colorScheme={useColorModeValue('purple', 'orange')} {...props} />
)

export const SecondaryButton = (props: ButtonProps) => (
  <Button variant="outline" bg="surface" {...props} />
)
