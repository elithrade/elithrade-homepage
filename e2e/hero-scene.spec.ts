import { test, expect } from './fixtures'
import type { Locator } from '@playwright/test'
import { HERO_SCENE, SCENES } from '../libs/scenes'

// Waits until the canvas has drawn a scene, not stayed blank. A blank canvas
// over the plain page background compresses to a tiny PNG; the rendered scene
// doesn't. (toDataURL can't be used: WebGL clears the drawing buffer.)
async function expectDrawn(canvas: Locator) {
  await expect
    .poll(async () => (await canvas.screenshot()).length)
    .toBeGreaterThan(10_000)
}

test('draws the 3D hero scene without fetching any model', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => requests.push(request.url()))

  await page.goto('/')

  const canvas = page.locator('.hero-scene canvas')
  await expect(canvas).toBeVisible()
  await expectDrawn(canvas)
  // The models are built in the page from layouts in its own JavaScript.
  expect(requests.filter(url => /\/models\/|\.glb/.test(url))).toEqual([])
})

test('switches to the other scene and remembers the choice', async ({
  page
}) => {
  const other = SCENES.find(scene => scene !== HERO_SCENE)!
  const switcher = page.getByRole('group', { name: '3D scene' })
  const canvas = page.locator('.hero-scene canvas')

  await page.goto('/')
  await expectDrawn(canvas)
  await expect(
    switcher.getByRole('button', { name: HERO_SCENE.label })
  ).toHaveAttribute('aria-pressed', 'true')
  const first = await canvas.elementHandle()

  await switcher.getByRole('button', { name: other.label }).click()
  await expect(
    switcher.getByRole('button', { name: other.label })
  ).toHaveAttribute('aria-pressed', 'true')
  // The other scene is drawn on the same canvas, not a new one.
  await expect(canvas).toHaveCount(1)
  expect(await first!.evaluate(node => node.isConnected)).toBe(true)
  await expectDrawn(canvas)

  // The pick sticks on the next page load.
  await page.reload()
  await expect(
    switcher.getByRole('button', { name: other.label })
  ).toHaveAttribute('aria-pressed', 'true')
})

test('leaves scrolling to the page', async ({ page }) => {
  await page.goto('/')
  const scene = page.locator('.hero-scene')
  await expect(scene.locator('canvas')).toBeVisible()

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

test('keeps the camera still for visitors who ask for less motion', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const canvas = page.locator('.hero-scene canvas')
  await expectDrawn(canvas)

  // The island's front rim fills the bottom of the canvas. It changes as soon
  // as the camera moves, and nothing on the island moves in front of it.
  const box = (await canvas.boundingBox())!
  const rim = {
    x: box.x,
    y: box.y + box.height * 0.9,
    width: box.width,
    height: box.height * 0.1
  }
  const rimBefore = await page.screenshot({ clip: rim })
  expect(rimBefore.length).toBeGreaterThan(1_000)
  const before = await canvas.screenshot()
  await page.waitForTimeout(1000)

  // No opening turn and no turntable, but the typing and the bee carry on.
  expect((await page.screenshot({ clip: rim })).equals(rimBefore)).toBe(true)
  expect((await canvas.screenshot()).equals(before)).toBe(false)
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
