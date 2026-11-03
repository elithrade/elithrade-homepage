import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../test-utils'
import Page from '../../pages/index'
import { CV_URL } from '../../libs/cv'

describe('Home page', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the intro and every section', () => {
    renderWithTheme(<Page buildYear={2026} />)

    expect(
      screen.getByText(/full stack developer based in Perth, Australia/)
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bin Hu' })).toBeInTheDocument()
    for (const name of ['Me', 'Bio', 'Technical Skills']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
    expect(screen.getByAltText('Profile image')).toHaveAttribute(
      'src',
      '/images/profile.jpg'
    )
  })

  it('computes years of experience from a 2006 start', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2030-06-15T00:00:00Z'))

    renderWithTheme(<Page buildYear={2026} />)

    expect(screen.getByText(/with over 24 years of hands/)).toBeInTheDocument()
  })

  it('links the Download CV button to the published CV', () => {
    renderWithTheme(<Page buildYear={2026} />)

    const link = screen.getByRole('link', { name: 'Download CV' })
    expect(link).toHaveAttribute('href', CV_URL)
    // The blob's Content-Disposition header triggers the download, so the
    // link must not open a new tab.
    expect(link).not.toHaveAttribute('target')
  })

  it.each([
    ['The University of New South Wales.', 'https://unsw.edu.au'],
    ['Fugro', 'https://www.fugro.com'],
    ['RACWA', 'https://rac.com.au']
  ])('links "%s" to %s in a new tab', (name, href) => {
    renderWithTheme(<Page buildYear={2026} />)

    const link = screen.getByRole('link', { name })
    expect(link).toHaveAttribute('href', href)
    expect(link).toHaveAttribute('target', '_blank')
  })
})
