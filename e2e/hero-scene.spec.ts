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

test('leaves scrolling to the page', async ({ page }) => {
  await page.goto('/')
  const scene = page.locator('.hero-scene')
  await expect(scene.locator('.chakra-spinner')).toHaveCount(0, {
    timeout: 15_000
  })

  // The mouse wheel over the scene scrolls the page instead of zooming in.
  await scene.hover()
  await page.mouse.wheel(0, 300)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0)

  // On a touch screen, a swipe up or down that starts on the scene is left
  // to the browser, which scrolls the page with it.
  await expect(scene.locator('canvas')).toHaveCSS('touch-action', 'pan-y')
})

test('keeps the scene still for visitors who ask for less motion', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const scene = page.locator('.hero-scene')
  await expect(scene.locator('.chakra-spinner')).toHaveCount(0, {
    timeout: 15_000
  })

  // Wait for the scene to be drawn (see the first test), then expect the
  // next second to change nothing: no opening turn, turntable or animation.
  const canvas = scene.locator('canvas')
  await expect
    .poll(async () => (await canvas.screenshot()).length)
    .toBeGreaterThan(10_000)
  const before = await canvas.screenshot()
  await page.waitForTimeout(1000)
  expect((await canvas.screenshot()).equals(before)).toBe(true)
})

test('stops drawing while scrolled out of view', async ({ page }) => {
  // Count the scene's draw calls.
  await page.addInitScript(() => {
    const counter = window as unknown as { heroDraws: number }
    counter.heroDraws = 0
    const proto = WebGL2RenderingContext.prototype
    const drawElements = proto.drawElements
    proto.drawElements = function (
      this: WebGL2RenderingContext,
      ...args: Parameters<typeof drawElements>
    ) {
      counter.heroDraws++
      return drawElements.apply(this, args)
    }
  })
  const draws = () =>
    page.evaluate(() => (window as unknown as { heroDraws: number }).heroDraws)

  await page.goto('/')
  const scene = page.locator('.hero-scene')
  await expect(scene.locator('.chakra-spinner')).toHaveCount(0, {
    timeout: 15_000
  })
  await expect.poll(draws).toBeGreaterThan(0)

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(scene).not.toBeInViewport()
  await page.waitForTimeout(500)
  const paused = await draws()
  await page.waitForTimeout(500)
  expect(await draws()).toBe(paused)

  // And picks up again when it's scrolled back.
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(draws).toBeGreaterThan(paused)
})

test('keeps the scene on screen while another loads', async ({ page }) => {
  const other = SCENES.find(scene => scene !== HERO_SCENE)!
  const scene = page.locator('.hero-scene')
  const spinner = scene.locator('.chakra-spinner')

  await page.goto('/')
  await expect(spinner).toHaveCount(0, { timeout: 15_000 })
  const canvas = await scene.locator('canvas').elementHandle()

  // Hold the other scene's models back until the checks are done.
  let release = () => {}
  const held = new Promise<void>(resolve => (release = resolve))
  await page.route(`**/models/${other.name}/*.glb`, async route => {
    await held
    await route.continue()
  })
  await page
    .getByRole('group', { name: '3D scene' })
    .getByRole('button', { name: other.label })
    .click()

  // The spinner shows over the first scene, which is still being drawn on
  // the same canvas.
  await expect(spinner).toBeVisible()
  await expect(scene.locator('canvas')).toHaveCount(1)
  expect(await canvas!.evaluate(node => node.isConnected)).toBe(true)
  expect((await scene.locator('canvas').screenshot()).length).toBeGreaterThan(
    10_000
  )

  release()
  await expect(spinner).toHaveCount(0, { timeout: 15_000 })
  expect(await canvas!.evaluate(node => node.isConnected)).toBe(true)
})
