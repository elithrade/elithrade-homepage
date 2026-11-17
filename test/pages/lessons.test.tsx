import { describe, it, expect, beforeEach } from 'vitest'
import type { GetStaticPropsResult } from 'next'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../test-utils'
import { setPath } from '../router'
import LessonsIndex, {
  getStaticProps as indexProps
} from '../../pages/lessons/index'
import ProjectPage, {
  getStaticPaths as projectPaths,
  getStaticProps as projectProps
} from '../../pages/lessons/[project]/index'
import SectionPage, {
  getStaticPaths as sectionPaths,
  getStaticProps as sectionProps
} from '../../pages/lessons/[project]/[section]'
import { plainText } from '../../components/inline-markdown'
import { lessonProjects } from '../../libs/content/lessons'
import { cardCount } from '../../libs/lessons'
import { missedKey } from '../../libs/missed-cards'

const lessons = lessonProjects[0]
const { project, sections } = lessons
const withCards = sections.find(s => s.cards.length >= 2)!

const propsOf = async <P,>(
  result: GetStaticPropsResult<P> | Promise<GetStaticPropsResult<P>>
): Promise<P> => {
  const resolved = await result
  if (!('props' in resolved)) throw new Error('expected props')
  return await resolved.props
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** The button that opens a card: its name starts with the question. */
const questionButton = (question: string) =>
  screen.getByRole('button', {
    name: new RegExp(`^${escape(plainText(question))}`)
  })
/** A paragraph whose text is the Markdown without its markers. */
const paragraph = (markdown: string) =>
  screen.getByText(
    (_, el) => el?.tagName === 'P' && el.textContent === plainText(markdown)
  )

const renderProject = async () => {
  setPath(`/lessons/${project.id}`)
  return renderWithTheme(
    <ProjectPage
      {...await propsOf(projectProps({ params: { project: project.id } }))}
    />
  )
}
const renderSection = async (id: string) => {
  setPath(`/lessons/${project.id}/${id}`)
  return renderWithTheme(
    <SectionPage
      {...await propsOf(
        sectionProps({ params: { project: project.id, section: id } })
      )}
    />
  )
}

/** The breadcrumb's links, then the current page's text. */
const breadcrumb = () => {
  const nav = screen.getByRole('navigation', { name: 'breadcrumb' })
  return {
    links: within(nav)
      .getAllByRole('link')
      .map(a => [a.textContent, a.getAttribute('href')]),
    current: nav.querySelector('[aria-current="page"]')?.textContent
  }
}

beforeEach(() => {
  localStorage.clear()
})

describe('Lessons page', () => {
  it('links a card to every project, with its counts', () => {
    renderWithTheme(<LessonsIndex {...indexProps().props} />)

    for (const { project: p, sections: s } of lessonProjects) {
      const card = screen
        .getByRole('link', { name: p.name })
        .closest('article')!
      expect(within(card).getByRole('link', { name: p.name })).toHaveAttribute(
        'href',
        `/lessons/${p.id}`
      )
      expect(card).toHaveTextContent(`${s.length} sections`)
    }
    expect(screen.getByText(`${cardCount(lessons)} cards`)).toBeInTheDocument()
  })
})

describe('Project page', () => {
  it('prerenders a page for every project and nothing else', async () => {
    const result = await projectPaths({})
    expect(result.fallback).toBe(false)
    expect(result.paths).toEqual(
      lessonProjects.map(l => ({ params: { project: l.project.id } }))
    )
  })

  it('is not found for an unknown project', async () => {
    expect(await projectProps({ params: { project: 'nope' } })).toEqual({
      notFound: true
    })
  })

  it('has a breadcrumb back to Lessons', async () => {
    await renderProject()

    expect(breadcrumb()).toEqual({
      links: [['Lessons', '/lessons']],
      current: project.name
    })
  })

  it('lists every section, linking to its page', async () => {
    await renderProject()

    const toc = screen.getByRole('navigation', { name: 'Sections' })
    expect(
      within(toc)
        .getAllByRole('link')
        .map(a => a.getAttribute('href'))
    ).toEqual(sections.map(s => `/lessons/${project.id}/${s.id}`))
  })

  it('finds a card by its question and links to it on its section page', async () => {
    const user = userEvent.setup()
    await renderProject()
    const section = sections[sections.length - 1]
    const card = section.cards[0]

    await user.type(
      screen.getByLabelText('Search questions'),
      plainText(card.question).slice(0, 30)
    )

    const results = screen.getByRole('list', { name: 'Search results' })
    expect(
      within(results).getByRole('link', {
        name: new RegExp(escape(plainText(card.question)))
      })
    ).toHaveAttribute('href', `/lessons/${project.id}/${section.id}#${card.id}`)
    expect(screen.queryByRole('navigation', { name: 'Sections' })).toBeNull()
  })

  it('says when nothing matches', async () => {
    const user = userEvent.setup()
    await renderProject()

    await user.type(screen.getByLabelText('Search questions'), 'zqxzqx')

    expect(screen.getByText('No questions match.')).toBeInTheDocument()
  })

  it('practises every card and remembers a missed one', async () => {
    const user = userEvent.setup()
    await renderProject()
    const first = sections[0].cards[0]
    const total = cardCount(lessons)
    expect(screen.queryByRole('button', { name: /Practice missed/ })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Practice all' }))
    expect(await screen.findByText(`Card 1 of ${total}`)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: plainText(first.question) })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show answer' }))
    expect(paragraph(first.answer[0])).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Missed it' }))
    expect(screen.getByText(`Card 2 of ${total}`)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'End practice' }))
    expect(
      screen.getByRole('button', { name: 'Practice missed (1)' })
    ).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(missedKey(project.id))!)).toEqual([
      first.id
    ])
  })
})

describe('Section page', () => {
  it('prerenders a page for every section and nothing else', async () => {
    const result = await sectionPaths({})
    expect(result.fallback).toBe(false)
    expect(result.paths).toEqual(
      lessonProjects.flatMap(l =>
        l.sections.map(s => ({
          params: { project: l.project.id, section: s.id }
        }))
      )
    )
  })

  it('is not found for an unknown section', async () => {
    expect(
      await sectionProps({ params: { project: project.id, section: 'nope' } })
    ).toEqual({ notFound: true })
  })

  it('has a breadcrumb through Lessons and the project', async () => {
    await renderSection(withCards.id)

    expect(breadcrumb()).toEqual({
      links: [
        ['Lessons', '/lessons'],
        [project.name, `/lessons/${project.id}`]
      ],
      current: plainText(withCards.title)
    })
  })

  it('starts with the answers hidden and opens one on click', async () => {
    const user = userEvent.setup()
    await renderSection(withCards.id)
    const card = withCards.cards[0]
    const button = questionButton(card.question)
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(paragraph(card.answer[0])).toBeInTheDocument()
  })

  it('shows and hides every answer at once', async () => {
    const user = userEvent.setup()
    await renderSection(withCards.id)

    await user.click(screen.getByRole('button', { name: 'Show all answers' }))
    for (const card of withCards.cards) {
      expect(questionButton(card.question)).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    }

    await user.click(screen.getByRole('button', { name: 'Hide all answers' }))
    for (const card of withCards.cards) {
      expect(questionButton(card.question)).toHaveAttribute(
        'aria-expanded',
        'false'
      )
    }
  })

  it('links to the sections before and after it', async () => {
    await renderSection(sections[1].id)

    expect(screen.getByRole('link', { name: /Previous/ })).toHaveAttribute(
      'href',
      `/lessons/${project.id}/${sections[0].id}`
    )
    expect(screen.getByRole('link', { name: /Next/ })).toHaveAttribute(
      'href',
      `/lessons/${project.id}/${sections[2].id}`
    )
  })

  it('has no previous link on the first section', async () => {
    await renderSection(sections[0].id)

    expect(screen.queryByRole('link', { name: /Previous/ })).toBeNull()
  })

  it('practises its cards, then the missed ones again', async () => {
    const user = userEvent.setup()
    await renderSection(withCards.id)
    const n = withCards.cards.length

    await user.click(
      screen.getByRole('button', { name: `Practice these ${n}` })
    )
    for (let i = 0; i < n; i++) {
      await user.click(screen.getByRole('button', { name: 'Show answer' }))
      await user.click(
        screen.getByRole('button', { name: i === 0 ? 'Missed it' : 'Got it' })
      )
    }

    expect(
      screen.getByText(`You got ${n - 1} of ${n}.`, { exact: false })
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Practice the 1 missed' })
    )
    expect(screen.getByText('Card 1 of 1')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: plainText(withCards.cards[0].question)
      })
    ).toBeInTheDocument()
  })

  it('marks a card missed in an earlier round', async () => {
    const card = withCards.cards[1]
    localStorage.setItem(missedKey(project.id), JSON.stringify([card.id]))

    await renderSection(withCards.id)

    expect(
      within(questionButton(card.question)).getByText('missed')
    ).toBeInTheDocument()
    expect(
      within(questionButton(withCards.cards[0].question)).queryByText('missed')
    ).toBeNull()
  })
})
