import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../test/test-utils'
import { WorkCard } from './work-card'
import { RACWA, type Work } from '../libs/works'

const work: Work = {
  id: 'example-work',
  title: 'Example work',
  organisation: RACWA,
  summary: 'An example summary.',
  highlights: ['Did a thing'],
  stack: ['TypeScript', 'React']
}

describe('WorkCard', () => {
  it('links the title to the work detail page', () => {
    renderWithTheme(<WorkCard work={work} />)

    expect(screen.getByRole('link', { name: 'Example work' })).toHaveAttribute(
      'href',
      '/works/example-work'
    )
  })

  it('shows the summary and technology tags', () => {
    renderWithTheme(<WorkCard work={work} />)

    expect(screen.getByText('An example summary.')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('omits the tag list when no technologies are known', () => {
    renderWithTheme(<WorkCard work={{ ...work, stack: [] }} />)

    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
