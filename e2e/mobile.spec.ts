import { test, expect } from './fixtures'

test.use({ viewport: { width: 390, height: 844 } })

test('mobile layout uses the hamburger menu', async ({ page }) => {
  await page.goto('/works')

  // Desktop links are hidden below the md breakpoint.
  await expect(page.getByRole('link', { name: 'GitHub' })).toBeHidden()

  await page.getByRole('button', { name: 'Options' }).click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitem', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/elithrade'
  )

  await expect(menu.getByRole('menuitem', { name: 'Works' })).toHaveAttribute(
    'href',
    '/works'
  )

  await menu.getByRole('menuitem', { name: 'About' }).click()
  await expect(page).toHaveURL('/')

  await page.getByRole('button', { name: 'Options' }).click()
  await page.getByRole('menu').getByRole('menuitem', { name: 'Works' }).click()
  await expect(page).toHaveURL('/works')
  await expect(page.getByRole('heading', { name: 'Works' })).toBeVisible()
})
