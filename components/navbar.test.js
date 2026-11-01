import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../test/test-utils'
import Navbar from './navbar'

const GITHUB_URL = 'https://github.com/elithrade'

describe('Navbar', () => {
  it('shows the logo linking home', () => {
    renderWithTheme(<Navbar path="/" />)

    const heading = screen.getByRole('heading', { level: 1 })
    const homeLink = within(heading).getByRole('link')
    expect(homeLink).toHaveAttribute('href', '/')
    expect(homeLink).toHaveTextContent('Bin Hu')
    expect(within(homeLink).getByAltText('logo')).toBeInTheDocument()
  })

  it('links to GitHub in a new tab', () => {
    renderWithTheme(<Navbar path="/" />)

    // The desktop nav is display:none at the base breakpoint and jsdom
    // doesn't evaluate media queries, so include hidden elements.
    const [desktopLink] = screen.getAllByRole('link', {
      name: /github/i,
      hidden: true
    })
    expect(desktopLink).toHaveAttribute('href', GITHUB_URL)
    expect(desktopLink).toHaveAttribute('target', '_blank')
    expect(desktopLink).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener')
    )
  })

  it('includes the theme toggle', () => {
    renderWithTheme(<Navbar path="/" />)

    expect(
      screen.getByRole('button', { name: 'Toggle theme' })
    ).toBeInTheDocument()
  })

  it('opens the mobile menu with About and GitHub entries', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Navbar path="/" />)

    await user.click(screen.getByRole('button', { name: 'Options' }))

    const menu = await screen.findByRole('menu')
    expect(
      within(menu).getByRole('menuitem', { name: 'About' })
    ).toHaveAttribute('href', '/')
    expect(
      within(menu).getByRole('menuitem', { name: 'GitHub' })
    ).toHaveAttribute('href', GITHUB_URL)
  })
})
