import type { Page } from '@playwright/test'
import { test, expect } from './fixtures'
import { CV_URL, CV_FILENAME } from '../libs/cv'
import { palette } from '../libs/theme'

// '#805ad5' -> 'rgb(128, 90, 213)', the form getComputedStyle reports.
const rgb = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return `rgb(${r}, ${g}, ${b})`
}

const currentMode = async (page: Page) =>
  (await page.locator('body').getAttribute('class'))?.includes('chakra-ui-dark')
    ? 'dark'
    : 'light'

test.describe('Download CV button', () => {
  test.beforeEach(async ({ page }) => {
    // Serve a stand-in PDF with the same headers as the real blob, so the
    // test doesn't depend on Azure or the network.
    await page.route(CV_URL, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: {
          'content-disposition': `attachment; filename="${CV_FILENAME}"`
        },
        body: '%PDF-1.7\n%%EOF\n'
      })
    )
    await page.goto('/')
  })

  test('downloads the CV as Bin-Hu-CV.pdf', async ({ page }) => {
    const button = page.getByRole('link', { name: 'Download CV' })
    await expect(button).toBeVisible()
    await expect(button).toHaveAttribute('href', CV_URL)

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      button.click()
    ])
    expect(download.suggestedFilename()).toBe(CV_FILENAME)
    // Downloading doesn't navigate away from the home page.
    await expect(page).toHaveURL('/')
  })

  test('the navbar CV link downloads it from any page', async ({ page }) => {
    await page.goto('/works')
    const link = page.getByRole('link', { name: 'CV', exact: true })
    await expect(link).toBeVisible()

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      link.click()
    ])
    expect(download.suggestedFilename()).toBe(CV_FILENAME)
    await expect(page).toHaveURL('/works')
  })

  test('matches the theme toggle colour in both modes', async ({ page }) => {
    const cv = page.getByRole('link', { name: 'Download CV' })
    const toggle = page.getByRole('button', { name: 'Toggle theme' })

    for (let i = 0; i < 2; i++) {
      // The toggle's colour is the palette's accentSolid in each mode.
      const accent = rgb(palette[await currentMode(page)].accentSolid)
      await expect(toggle).toHaveCSS('background-color', accent)
      await expect(cv).toHaveCSS('background-color', accent)

      const before = await currentMode(page)
      await toggle.click()
      await expect.poll(() => currentMode(page)).not.toBe(before)
    }
  })
})
