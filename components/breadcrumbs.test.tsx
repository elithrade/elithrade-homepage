import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithTheme } from '../test/test-utils'
import { setPath } from '../test/router'
import { Breadcrumbs, crumbsFromPath } from './breadcrumbs'

describe('crumbsFromPath', () => {
  it('makes a crumb per segment, each linking to the path up to it', () => {
    expect(crumbsFromPath('/lessons/url-shortener/testing')).toEqual([
      { href: '/lessons', label: 'Lessons' },
      { href: '/lessons/url-shortener', label: 'url-shortener' },
      { href: '/lessons/url-shortener/testing', label: 'testing' }
    ])
  })

  it('names segments from labels, keyed by href, before the fixed names', () => {
    expect(
      crumbsFromPath('/works/acme', { '/works/acme': 'Acme card' })
    ).toEqual([
      { href: '/works', label: 'Works' },
      { href: '/works/acme', label: 'Acme card' }
    ])
  })

  it('tells apart segments that share a slug', () => {
    const labels = { '/lessons/a': 'Project A', '/lessons/a/a': 'Section A' }
    expect(crumbsFromPath('/lessons/a/a', labels).map(c => c.label)).toEqual([
      'Lessons',
      'Project A',
      'Section A'
    ])
  })

  it('ignores the query and hash', () => {
    expect(crumbsFromPath('/works/acme?x=1#top').map(c => c.href)).toEqual([
      '/works',
      '/works/acme'
    ])
  })

  it('has no crumbs on the home page', () => {
    expect(crumbsFromPath('/')).toEqual([])
  })
})

describe('Breadcrumbs', () => {
  it('links each page above this one and ends on the current page', () => {
    setPath('/lessons/url-shortener/concurrency-and-atomicity')
    renderWithTheme(
      <Breadcrumbs
        labels={{
          '/lessons/url-shortener/concurrency-and-atomicity':
            'Concurrency and atomicity'
        }}
      />
    )

    const nav = screen.getByRole('navigation', { name: 'breadcrumb' })
    expect(
      within(nav)
        .getAllByRole('listitem')
        .map(item => item.textContent)
    ).toEqual(['Lessons', 'url-shortener', 'Concurrency and atomicity'])
    expect(within(nav).getByRole('link', { name: 'Lessons' })).toHaveAttribute(
      'href',
      '/lessons'
    )
    expect(
      within(nav).getByRole('link', { name: 'url-shortener' })
    ).toHaveAttribute('href', '/lessons/url-shortener')

    // The current page is marked as such and isn't a link.
    expect(within(nav).getAllByRole('link')).toHaveLength(2)
    expect(within(nav).getByText('Concurrency and atomicity')).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('renders nothing on the home page', () => {
    setPath('/')
    renderWithTheme(<Breadcrumbs />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
