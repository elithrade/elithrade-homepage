import { test, expect } from './fixtures'
import { organisations, works } from '../libs/works'

const GRASS_TEAL = 'rgb(136, 204, 202)'

test('navbar Works link opens the works page and is highlighted', async ({
  page
}) => {
  await page.goto('/')
  const navLink = page.getByRole('link', { name: 'Works', exact: true })
  await expect(navLink).not.toHaveCSS('background-color', GRASS_TEAL)

  await navLink.click()

  await expect(page).toHaveURL('/works')
  await expect(page).toHaveTitle('Works - Bin Hu')
  await expect(navLink).toHaveCSS('background-color', GRASS_TEAL)
  for (const org of organisations) {
    await expect(
      page.getByRole('heading', { level: 4, name: org.name })
    ).toBeVisible()
  }
  // One card (an <article> inside the page's <article>) per work.
  await expect(page.locator('article article')).toHaveCount(works.length)
})

test('a card opens its detail page, which links back', async ({ page }) => {
  const work = works[0]
  await page.goto('/works')

  await page.getByRole('link', { name: work.title }).click()

  await expect(page).toHaveURL(`/works/${work.id}`)
  await expect(
    page.getByRole('heading', { level: 2, name: work.title })
  ).toBeVisible()
  // The Works nav item stays highlighted on detail pages.
  await expect(
    page.getByRole('link', { name: 'Works', exact: true }).first()
  ).toHaveCSS('background-color', GRASS_TEAL)

  // The back link inside the page content (the navbar sits outside it).
  await page.getByRole('article').getByRole('link', { name: 'Works' }).click()
  await expect(page).toHaveURL('/works')
})

for (const work of works) {
  test(`detail page for ${work.id} renders`, async ({ page }) => {
    const res = await page.goto(`/works/${work.id}`)

    expect(res?.status()).toBe(200)
    await expect(page).toHaveTitle(`${work.title} - Bin Hu`)
    await expect(
      page.getByRole('heading', { level: 2, name: work.title })
    ).toBeVisible()
    for (const highlight of work.highlights) {
      await expect(page.getByText(highlight)).toBeVisible()
    }
  })
}

test.describe('unknown works', () => {
  test.use({ allowedErrors: [/^http 404: .*\/works\/does-not-exist$/] })

  test('return the 404 page', async ({ page }) => {
    const res = await page.goto('/works/does-not-exist')
    expect(res?.status()).toBe(404)
    await expect(page.getByText('This page could not be found')).toBeVisible()
  })
})
