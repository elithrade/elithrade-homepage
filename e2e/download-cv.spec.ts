import type { Page } from '@playwright/test'
import { test, expect } from './fixtures'
import { CV_URL, CV_FILENAME } from '../libs/cv'

const backgroundOf = (page: Page, name: string, role: 'button' | 'link') =>
  page
    .getByRole(role, { name })
    .evaluate(el => getComputedStyle(el).backgroundColor)

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

  test('matches the theme toggle colour in both modes', async ({ page }) => {
    // Both buttons animate their background when the mode changes, so read
    // them together until they agree.
    const bothColours = async () => [
      await backgroundOf(page, 'Download CV', 'link'),
      await backgroundOf(page, 'Toggle theme', 'button')
    ]
    const settledColour = async () => {
      await expect
        .poll(async () => {
          const [cv, toggle] = await bothColours()
          return cv === toggle
        })
        .toBe(true)
      return (await bothColours())[0]
    }

    const first = await settledColour()
    await page.getByRole('button', { name: 'Toggle theme' }).click()
    await expect.poll(settledColour).not.toBe(first)
  })
})
