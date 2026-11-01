import type { ReactElement } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { render, type RenderOptions } from '@testing-library/react'
import theme from '../libs/theme'

export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>, options)
}
