import { test, expect } from './fixtures'
import {
  bioEntries,
  careerStartYear,
  noBreakHyphens,
  summaryParagraphs
} from '../libs/content/cv'

test.describe('home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has the site title and intro', async ({ page }) => {
    await expect(page).toHaveTitle('Bin Hu - Homepage')
    await expect(
      page.getByText('full stack developer based in Perth, Australia')
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Bin Hu' })
    ).toBeVisible()
  })

  // A browser that reuses its stored HTML after a deployment asks for script
  // files of the previous build, which no longer exist, and the page stays
  // empty. See the Cache-Control header in next.config.ts.
  test('tells browsers to check for new HTML on every visit', async ({
    request
  }) => {
    const response = await request.get('/')
    const cacheControl = response.headers()['cache-control']
    expect(cacheControl).toBe('public, max-age=0, must-revalidate')
    expect(cacheControl).not.toContain('stale-while-revalidate')
  })

  test('shows a quote with its author', async ({ page }) => {
    // The quote comes from ZenQuotes when the page is generated, or is the
    // fallback if that failed, so check its shape rather than its text.
    const quote = page.getByRole('figure')
    await expect(quote.locator('blockquote')).toHaveText(/^“.+”$/)
    await expect(quote.locator('figcaption')).toHaveText(/^— \S/)
  })

  test('shows every section', async ({ page }) => {
    for (const name of ['Me', 'Bio', 'Technical Skills']) {
      await expect(page.getByRole('heading', { name })).toBeVisible()
    }
  })

  // The expected text comes from content/cv.json, so rewording the CV's
  // summary doesn't fail this test.
  test('shows the summary with the years of experience', async ({ page }) => {
    const years = new Date().getFullYear() - careerStartYear()
    for (const paragraph of summaryParagraphs(years)) {
      await expect(page.getByText(noBreakHyphens(paragraph))).toBeVisible()
    }
  })

  test('loads the profile image', async ({ page }) => {
    const img = page.getByAltText('Profile image')
    await expect(img).toBeVisible()
    await expect
      .poll(() =>
        img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)
      )
      .toBeGreaterThan(0)
  })

  test('opens employer links in a new tab', async ({ page }) => {
    for (const { organisation } of bioEntries()) {
      const link = page.getByRole('link', { name: organisation.name })
      await expect(link).toHaveAttribute('href', organisation.url)
      await expect(link).toHaveAttribute('target', '_blank')
    }
  })
})
