import { test, expect } from './fixtures'
import { PETS } from '../libs/pets'

test('loads and renders the 3D cube pets', async ({ page }) => {
  const models = PETS.map(pet =>
    page.waitForResponse(res => res.url().endsWith(pet.url))
  )

  await page.goto('/')

  for (const model of models) expect((await model).ok()).toBe(true)
  const container = page.locator('.cube-pets')
  await expect(container.locator('canvas')).toBeVisible()
  // The spinner is removed once the models have been added to the scene.
  await expect(container.locator('.chakra-spinner')).toHaveCount(0, {
    timeout: 15_000
  })

  // The canvas should have drawn the pets, not stayed blank. A blank canvas
  // over the plain page background compresses to a tiny PNG; the rendered
  // pets don't. (toDataURL can't be used: WebGL clears the drawing buffer.)
  const shot = await container.locator('canvas').screenshot()
  expect(shot.length).toBeGreaterThan(10_000)
})
