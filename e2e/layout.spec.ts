import { test, expect } from './fixtures'

test('works thumbnails get rounded corners', async ({ page }) => {
  await page.goto('/works')

  const thumbnail = page.locator('img.grid-item-thumbnail').first()
  await expect(thumbnail).toHaveCSS('border-radius', '12px')
})

test.describe('navbar link colour', () => {
  for (const [mode, colour] of [
    ['light', 'rgb(26, 32, 44)'], // gray.800
    ['dark', 'rgba(255, 255, 255, 0.92)'] // whiteAlpha.900
  ]) {
    test(`is readable in ${mode} mode`, async ({ page }) => {
      await page.addInitScript(m => {
        localStorage.setItem('chakra-ui-color-mode', m)
      }, mode)
      await page.goto('/')

      await expect(page.getByRole('link', { name: 'GitHub' })).toHaveCSS(
        'color',
        colour
      )
    })
  }
})

test('has a favicon that loads', async ({ page, request }) => {
  await page.goto('/')

  const icons = page.locator('link[rel="icon"]')
  expect(await icons.count()).toBeGreaterThan(0)
  for (const href of await icons.evaluateAll(links =>
    links.map(l => (l as HTMLLinkElement).href)
  )) {
    const res = await request.get(href)
    expect(res.status(), href).toBe(200)
    expect(res.headers()['content-type'], href).toMatch(/^image\//)
  }
})
