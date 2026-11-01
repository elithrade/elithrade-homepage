import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../test/test-utils'
import ThemeToggleButton from './theme-toggle-button'

describe('ThemeToggleButton', () => {
  it('renders an accessible toggle button', () => {
    renderWithTheme(<ThemeToggleButton />)

    expect(
      screen.getByRole('button', { name: 'Toggle theme' })
    ).toBeInTheDocument()
  })

  it('switches between light and dark mode on each click', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggleButton />)

    // Starts in the theme's initialColorMode.
    expect(document.body).toHaveClass('chakra-ui-dark')

    await user.click(screen.getByRole('button', { name: 'Toggle theme' }))
    expect(document.body).toHaveClass('chakra-ui-light')
    expect(document.body).not.toHaveClass('chakra-ui-dark')

    await user.click(
      await screen.findByRole('button', { name: 'Toggle theme' })
    )
    expect(document.body).toHaveClass('chakra-ui-dark')
  })
})
