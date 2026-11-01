import { test, expect } from './fixtures'

test('works page renders and the logo links back home', async ({ page }) => {
  await page.goto('/works')
  await expect(page.getByRole('heading', { name: 'Works' })).toBeVisible()

  await page.getByRole('heading', { level: 1 }).getByRole('link').click()
  await expect(page).toHaveURL('/')
  await expect(
    page.getByRole('heading', { level: 2, name: 'Bin Hu' })
  ).toBeVisible()
})

test('desktop navbar links to GitHub in a new tab', async ({ page }) => {
  await page.goto('/')
  const github = page.getByRole('link', { name: 'GitHub' })
  await expect(github).toBeVisible()
  await expect(github).toHaveAttribute('href', 'https://github.com/elithrade')
  await expect(github).toHaveAttribute('target', '_blank')
})

test.describe('unknown routes', () => {
  test.use({ allowedErrors: [/^http 404: .*\/does-not-exist$/] })

  test('return the 404 page', async ({ page }) => {
    const res = await page.goto('/does-not-exist')
    expect(res.status()).toBe(404)
    await expect(page.getByText('This page could not be found')).toBeVisible()
  })
})
