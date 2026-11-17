import { test, expect } from './fixtures'
import { lessonProjects } from '../libs/content/lessons'
import { plainText } from '../components/inline-markdown'

const { project, sections } = lessonProjects[0]
const section = sections.find(s => s.cards.length >= 2)!
const card = section.cards[1]

test('navbar Lessons link opens the lessons page, which links to a project', async ({
  page
}) => {
  await page.goto('/')
  const navLink = page.getByRole('link', { name: 'Lessons', exact: true })

  await navLink.click()

  await expect(page).toHaveURL('/lessons')
  await expect(page).toHaveTitle('Lessons - Bin Hu')
  await expect(navLink).toHaveAttribute('aria-current', 'page')

  await page.getByRole('link', { name: project.name, exact: true }).click()

  await expect(page).toHaveURL(`/lessons/${project.id}`)
  await expect(
    page.getByRole('navigation', { name: 'Sections' }).getByRole('link')
  ).toHaveCount(sections.length)
})

test('a search result opens its card on the section page', async ({ page }) => {
  await page.goto(`/lessons/${project.id}`)

  await page
    .getByLabel('Search questions')
    .fill(plainText(card.question).slice(0, 30))
  await page
    .getByRole('list', { name: 'Search results' })
    .getByRole('link', { name: plainText(card.question) })
    .click()

  await expect(page).toHaveURL(
    `/lessons/${project.id}/${section.id}#${card.id}`
  )
  await expect(
    page.getByRole('button', { name: plainText(card.question) })
  ).toHaveAttribute('aria-expanded', 'true')
})

test('a card missed in practice is remembered after a reload', async ({
  page
}) => {
  await page.goto(`/lessons/${project.id}/${section.id}`)

  await page
    .getByRole('button', { name: `Practice these ${section.cards.length}` })
    .click()
  await page.getByRole('button', { name: 'Show answer' }).click()
  await page.getByRole('button', { name: 'Missed it' }).click()
  await page.getByRole('button', { name: 'End practice' }).click()
  await page.reload()

  const first = page.getByRole('button', {
    name: new RegExp(`^${plainText(section.cards[0].question).slice(0, 20)}`)
  })
  await expect(first.getByText('missed')).toBeVisible()

  await page.goto(`/lessons/${project.id}`)
  await expect(
    page.getByRole('button', { name: 'Practice missed (1)' })
  ).toBeVisible()
})
