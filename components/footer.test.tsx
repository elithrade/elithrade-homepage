import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../test/test-utils'
import Footer, {
  LINKEDIN_URL,
  SOURCE_URL,
  TEMPLATE_URL,
  ZENQUOTES_URL
} from './footer'

describe('Footer', () => {
  it('shows the copyright line with the current year', () => {
    renderWithTheme(<Footer />)

    expect(
      screen.getByText(`© ${new Date().getFullYear()} Bin Hu`)
    ).toBeInTheDocument()
  })

  it.each([
    ['LinkedIn', LINKEDIN_URL],
    ['Source on GitHub', SOURCE_URL],
    ['craftz.dog', TEMPLATE_URL]
  ])('links "%s" to %s in a new tab', (name, href) => {
    renderWithTheme(<Footer />)

    const link = screen.getByRole('link', { name })
    expect(link).toHaveAttribute('href', href)
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('credits ZenQuotes only when asked to', () => {
    const withoutQuote = renderWithTheme(<Footer />)
    expect(
      screen.queryByRole('link', { name: 'ZenQuotes' })
    ).not.toBeInTheDocument()
    withoutQuote.unmount()

    renderWithTheme(<Footer showQuoteAttribution />)
    expect(screen.getByRole('link', { name: 'ZenQuotes' })).toHaveAttribute(
      'href',
      ZENQUOTES_URL
    )
  })
})
