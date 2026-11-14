import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithTheme } from '../test-utils'
import Works from '../../pages/works/index'
import WorkPage, {
  getStaticPaths,
  getStaticProps
} from '../../pages/works/[id]'
import { noBreakHyphens } from '../../libs/content/cv'
import { groups, works, type Work } from '../../libs/works'

describe('Works page', () => {
  it('has a section per group, with the role and period at an organisation', () => {
    renderWithTheme(<Works />)

    for (const group of groups) {
      expect(
        screen.getByRole('heading', { level: 4, name: group.name })
      ).toBeInTheDocument()
      if (group.caption) {
        expect(screen.getByText(group.caption)).toBeInTheDocument()
      }
    }
  })

  it('links a card to every work', () => {
    renderWithTheme(<Works />)

    for (const work of works) {
      expect(screen.getByRole('link', { name: work.title })).toHaveAttribute(
        'href',
        `/works/${work.id}`
      )
    }
  })
})

describe('Work detail page', () => {
  it('prerenders a page for every work and nothing else', async () => {
    const result = await getStaticPaths({})
    expect(result.fallback).toBe(false)
    expect(result.paths).toEqual(works.map(w => ({ params: { id: w.id } })))
  })

  it('returns notFound for an unknown id', async () => {
    expect(await getStaticProps({ params: { id: 'nope' } })).toEqual({
      notFound: true
    })
  })

  const example: Work = {
    id: 'example',
    title: 'Example work',
    group: { name: 'Acme', caption: 'Engineer · 2020 – present' },
    period: '2020 – present',
    tagline: null,
    url: null,
    highlights: ['Built a full-stack thing.', 'Shipped it.'],
    stack: ['TypeScript', 'React']
  }

  it('shows the work with its group, period, highlights and stack', () => {
    renderWithTheme(<WorkPage work={example} />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Example work' })
    ).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('2020 – present')).toBeInTheDocument()
    // Hyphens inside words are rendered non-breaking.
    expect(
      screen.getByText(noBreakHyphens('Built a full-stack thing.'))
    ).toBeInTheDocument()
    expect(screen.getByText('Shipped it.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Stack' })).toBeInTheDocument()
    for (const tech of example.stack) {
      expect(screen.getByText(tech)).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: 'Works' })).toHaveAttribute(
      'href',
      '/works'
    )
  })

  it("shows a project's description and links to it in a new tab", () => {
    const project: Work = {
      ...example,
      tagline: 'A small tool',
      url: 'https://github.com/me/tool'
    }
    renderWithTheme(<WorkPage work={project} />)

    expect(screen.getByText('A small tool')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'github.com/me/tool' })
    expect(link).toHaveAttribute('href', 'https://github.com/me/tool')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders every work of the CV', () => {
    for (const work of works) {
      const { unmount } = renderWithTheme(<WorkPage work={work} />)
      for (const highlight of work.highlights) {
        expect(
          screen.getByText(noBreakHyphens(highlight)),
          work.id
        ).toBeInTheDocument()
      }
      unmount()
    }
  })

  it('leaves out the Stack heading when no technologies are known', () => {
    const work: Work = { ...example, stack: [] }
    renderWithTheme(<WorkPage work={work} />)

    expect(
      screen.queryByRole('heading', { name: 'Stack' })
    ).not.toBeInTheDocument()
    const highlights = screen.getByRole('list')
    expect(within(highlights).getAllByRole('listitem')).toHaveLength(
      work.highlights.length
    )
  })
})
