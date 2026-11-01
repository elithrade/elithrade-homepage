import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithTheme } from '../test-utils'
import Works from '../../pages/works/index'
import WorkPage, {
  getStaticPaths,
  getStaticProps
} from '../../pages/works/[id]'
import { getWork, organisations, works } from '../../libs/works'

describe('Works page', () => {
  it('has a section per organisation with its role and period', () => {
    renderWithTheme(<Works />)

    for (const org of organisations) {
      expect(
        screen.getByRole('heading', { level: 4, name: org.name })
      ).toBeInTheDocument()
      expect(
        screen.getByText(`${org.role} · ${org.period}`)
      ).toBeInTheDocument()
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

  it('shows the work with its highlights and stack', () => {
    const work = getWork('rov-video-streaming')!
    renderWithTheme(<WorkPage work={work} />)

    expect(
      screen.getByRole('heading', { level: 2, name: work.title })
    ).toBeInTheDocument()
    expect(screen.getByText(work.summary)).toBeInTheDocument()
    for (const highlight of work.highlights) {
      expect(screen.getByText(highlight)).toBeInTheDocument()
    }
    for (const tech of work.stack) {
      expect(screen.getByText(tech)).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /works/i })).toHaveAttribute(
      'href',
      '/works'
    )
  })

  it('leaves out the Stack heading when no technologies are known', () => {
    const work = works.find(w => w.stack.length === 0)!
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
