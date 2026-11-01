import { test, expect } from './fixtures'

// The page is prerendered at build time. The years-of-experience count must
// follow the visitor's clock, without a server/client hydration mismatch,
// even when the site hasn't been rebuilt since a new year started.
test('counts years of experience from the current date', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2031-03-01T00:00:00Z'))

  await page.goto('/')

  await expect(page.getByText('with over 25 years')).toBeVisible()
})
