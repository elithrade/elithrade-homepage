import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../test/test-utils'
import Navbar from './navbar'
import { CV_URL } from '../libs/cv'

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

  it('has a Download CV button that downloads in the same tab', () => {
    renderWithTheme(<Navbar path="/" />)

    // The button is display:none at the base breakpoint and jsdom doesn't
    // evaluate media queries, so its accessible name computes as empty:
    // match on its text instead.
    const cv = screen
      .getAllByRole('link', { hidden: true })
      .find(el => el.textContent === 'Download CV')
    expect(cv).toHaveAttribute('href', CV_URL)
    // The CV is served as an attachment, so it downloads without leaving
    // the page; a new tab would just flash open and close.
    expect(cv).not.toHaveAttribute('target')
  })

  it.each([
    ['/', false],
    ['/works', true],
    ['/works/rov-video-streaming', true]
  ])('on %s, the Works link is highlighted: %s', (path, highlighted) => {
    renderWithTheme(<Navbar path={path} />)

    const works = screen.getByRole('link', { name: 'Works', hidden: true })
    expect(works).toHaveAttribute('href', '/works')
    expect(works).not.toHaveAttribute('target')
    // jsdom can't resolve the theme's colour variables, so check
    // aria-current here; e2e checks the rendered colours.
    if (highlighted) {
      expect(works).toHaveAttribute('aria-current', 'page')
    } else {
      expect(works).not.toHaveAttribute('aria-current')
    }
  })

  it('includes the theme toggle', () => {
    renderWithTheme(<Navbar path="/" />)

    expect(
      screen.getByRole('button', { name: 'Toggle theme' })
    ).toBeInTheDocument()
  })

  it('opens the mobile menu with About, Works, GitHub and CV entries', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Navbar path="/" />)

    await user.click(screen.getByRole('button', { name: 'Options' }))

    const menu = await screen.findByRole('menu')
    expect(
      within(menu).getByRole('menuitem', { name: 'About' })
    ).toHaveAttribute('href', '/')
    expect(
      within(menu).getByRole('menuitem', { name: 'Works' })
    ).toHaveAttribute('href', '/works')
    expect(
      within(menu).getByRole('menuitem', { name: 'GitHub' })
    ).toHaveAttribute('href', GITHUB_URL)
    expect(
      within(menu).getByRole('menuitem', { name: 'Download CV' })
    ).toHaveAttribute('href', CV_URL)
  })
})
