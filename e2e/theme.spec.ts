import type { Page } from '@playwright/test'
import { test, expect } from './fixtures'

const currentMode = (page: Page) =>
  page
    .locator('body')
    .getAttribute('class')
    .then(cls => (cls?.includes('chakra-ui-dark') ? 'dark' : 'light'))

test('toggles colour mode and remembers it after reload', async ({ page }) => {
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Toggle theme' })
  await expect(toggle).toBeVisible()

  const initial = await currentMode(page)
  const flipped = initial === 'dark' ? 'light' : 'dark'

  await toggle.click()
  await expect(page.locator('body')).toHaveClass(
    new RegExp(`chakra-ui-${flipped}`)
  )
  await expect(page.locator('html')).toHaveAttribute('data-theme', flipped)

  await page.reload()
  await expect(page.locator('body')).toHaveClass(
    new RegExp(`chakra-ui-${flipped}`)
  )

  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await expect(page.locator('body')).toHaveClass(
    new RegExp(`chakra-ui-${initial}`)
  )
})
