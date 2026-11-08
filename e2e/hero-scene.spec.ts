import { test, expect } from './fixtures'
import { HERO_SCENE, SCENES } from '../libs/scenes'

test('loads and renders the 3D hero scene', async ({ page }) => {
  const models = Object.values(HERO_SCENE.models).map(url =>
    page.waitForResponse(res => res.url().endsWith(url))
  )

  await page.goto('/')

  for (const model of models) expect((await model).ok()).toBe(true)
  const container = page.locator('.hero-scene')
  await expect(container.locator('canvas')).toBeVisible()
  // The spinner is removed once the models have been added to the scene.
  await expect(container.locator('.chakra-spinner')).toHaveCount(0, {
    timeout: 15_000
  })

  // The canvas should have drawn the scene, not stayed blank. A blank canvas
  // over the plain page background compresses to a tiny PNG; the rendered
  // scene doesn't. (toDataURL can't be used: WebGL clears the drawing buffer.)
  const shot = await container.locator('canvas').screenshot()
  expect(shot.length).toBeGreaterThan(10_000)
})

test('switches to the other scene and remembers the choice', async ({
  page
}) => {
  const other = SCENES.find(scene => scene !== HERO_SCENE)!
  const switcher = page.getByRole('group', { name: '3D scene' })
  const spinner = page.locator('.hero-scene .chakra-spinner')

  await page.goto('/')
  await expect(spinner).toHaveCount(0, { timeout: 15_000 })
  await expect(
    switcher.getByRole('button', { name: HERO_SCENE.label })
  ).toHaveAttribute('aria-pressed', 'true')

  const models = Object.values(other.models).map(url =>
    page.waitForResponse(res => res.url().endsWith(url))
  )
  await switcher.getByRole('button', { name: other.label }).click()
  for (const model of models) expect((await model).ok()).toBe(true)
  await expect(spinner).toHaveCount(0, { timeout: 15_000 })
  await expect(
    switcher.getByRole('button', { name: other.label })
  ).toHaveAttribute('aria-pressed', 'true')

  // The pick sticks on the next page load.
  await page.reload()
  await expect(
    switcher.getByRole('button', { name: other.label })
  ).toHaveAttribute('aria-pressed', 'true')
})
