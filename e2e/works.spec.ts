import { test, expect } from './fixtures'
import { organisations, works } from '../libs/works'

// The highlighted nav item uses the theme toggle's colour: purple.500 in
// light mode, orange.200 in dark.
const ACCENT = {
  light: 'rgb(128, 90, 213)',
  dark: 'rgb(251, 211, 141)'
}

for (const [mode, accent] of Object.entries(ACCENT)) {
  test(`in ${mode} mode the active nav item matches the theme toggle`, async ({
    page
  }) => {
    await page.addInitScript(m => {
      localStorage.setItem('chakra-ui-color-mode', m)
    }, mode)
    await page.goto('/works')

    const navLink = page.getByRole('link', { name: 'Works', exact: true })
    const toggle = page.getByRole('button', { name: 'Toggle theme' })
    await expect(toggle).toHaveCSS('background-color', accent)
    await expect(navLink).toHaveCSS('background-color', accent)
  })
}

test('navbar Works link opens the works page and is highlighted', async ({
  page
}) => {
  await page.goto('/')
  const navLink = page.getByRole('link', { name: 'Works', exact: true })
  await expect(navLink).not.toHaveAttribute('aria-current')

  await navLink.click()

  await expect(page).toHaveURL('/works')
  await expect(page).toHaveTitle('Works - Bin Hu')
  await expect(navLink).toHaveAttribute('aria-current', 'page')
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
  ).toHaveAttribute('aria-current', 'page')

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
