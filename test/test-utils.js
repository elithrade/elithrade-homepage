import { ChakraProvider } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import theme from '../libs/theme'

export function renderWithTheme(ui, options) {
  return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>, options)
}
