import { test, expect } from './fixtures'
import { ARENA_MODELS, arenaModelUrl } from '../libs/arena'

test('loads and renders the 3D arena', async ({ page }) => {
  const models = ARENA_MODELS.map(model =>
    page.waitForResponse(res => res.url().endsWith(arenaModelUrl(model)))
  )

  await page.goto('/')

  for (const model of models) expect((await model).ok()).toBe(true)
  const container = page.locator('.mini-arena')
  await expect(container.locator('canvas')).toBeVisible()
  // The spinner is removed once the models have been added to the scene.
  await expect(container.locator('.chakra-spinner')).toHaveCount(0, {
    timeout: 15_000
  })

  // The canvas should have drawn the arena, not stayed blank. A blank canvas
  // over the plain page background compresses to a tiny PNG; the rendered
  // arena doesn't. (toDataURL can't be used: WebGL clears the drawing buffer.)
  const shot = await container.locator('canvas').screenshot()
  expect(shot.length).toBeGreaterThan(10_000)
})
