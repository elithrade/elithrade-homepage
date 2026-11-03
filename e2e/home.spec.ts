import { test, expect } from './fixtures'

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

  test('shows years of experience counted from 2006', async ({ page }) => {
    const years = new Date().getFullYear() - 2006
    await expect(page.getByText(`with over ${years} years`)).toBeVisible()
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
    for (const [name, href] of [
      ['The University of New South Wales.', 'https://unsw.edu.au'],
      ['Fugro', 'https://www.fugro.com'],
      ['RACWA', 'https://rac.com.au']
    ]) {
      const link = page.getByRole('link', { name })
      await expect(link).toHaveAttribute('href', href)
      await expect(link).toHaveAttribute('target', '_blank')
    }
  })
})
