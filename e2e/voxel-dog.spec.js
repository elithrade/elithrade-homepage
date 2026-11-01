import { test, expect } from './fixtures'

test('loads and renders the 3D voxel dog', async ({ page }) => {
  const model = page.waitForResponse(res => res.url().endsWith('/dog.glb'))

  await page.goto('/')

  expect((await model).ok()).toBe(true)
  const container = page.locator('.voxel-dog')
  await expect(container.locator('canvas')).toBeVisible()
  // The spinner is removed once the model has been added to the scene.
  await expect(container.locator('.chakra-spinner')).toHaveCount(0, {
    timeout: 15_000
  })

  // The canvas should have drawn the model, not stayed blank. A blank canvas
  // over the plain page background compresses to a tiny PNG; the rendered
  // dog doesn't. (toDataURL can't be used: WebGL clears the drawing buffer.)
  const shot = await container.locator('canvas').screenshot()
  expect(shot.length).toBeGreaterThan(10_000)
})
