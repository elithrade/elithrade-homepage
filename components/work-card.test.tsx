import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../test/test-utils'
import { WorkCard } from './work-card'
import type { Work } from '../libs/works'

const work: Work = {
  id: 'example-work',
  title: 'Example work',
  group: { name: 'Acme', caption: 'Engineer · 2020 – present' },
  period: '2020 – present',
  tagline: null,
  url: null,
  highlights: ['Did a thing.', 'Did another.'],
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

  it('shows the first highlight and the technology tags', () => {
    renderWithTheme(<WorkCard work={work} />)

    expect(screen.getByText('Did a thing.')).toBeInTheDocument()
    expect(screen.queryByText('Did another.')).not.toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it("shows a project's description in place of a highlight", () => {
    renderWithTheme(<WorkCard work={{ ...work, tagline: 'A small tool' }} />)

    expect(screen.getByText('A small tool')).toBeInTheDocument()
    expect(screen.queryByText('Did a thing.')).not.toBeInTheDocument()
  })

  it('omits the tag list when no technologies are known', () => {
    renderWithTheme(<WorkCard work={{ ...work, stack: [] }} />)

    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
