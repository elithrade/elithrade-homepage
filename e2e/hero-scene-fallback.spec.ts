import { test, expect } from './fixtures'

const homeHeading = { level: 2, name: 'Bin Hu' } as const

test.describe('when the scene models fail to load', () => {
  test.use({ allowedErrors: [/^http 404: .*\/models\/.*\.glb$/] })

  test('stops the spinner and keeps the page working', async ({ page }) => {
    await page.route('**/models/**/*.glb', route =>
      route.fulfill({ status: 404 })
    )

    await page.goto('/')

    await expect(page.getByRole('heading', homeHeading)).toBeVisible()
    await expect(page.locator('.hero-scene .chakra-spinner')).toHaveCount(0, {
      timeout: 15_000
    })
  })
})

test.describe('when WebGL is unavailable', () => {
  // three.js logs its own console error when it can't create a context.
  test.use({ allowedErrors: [/^console: .*WebGL/] })

  test('renders the page without the 3D scene', async ({ page }) => {
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type.startsWith('webgl')) return null
        return (getContext as (...a: unknown[]) => unknown).apply(this, [
          type,
          ...args
        ])
      } as typeof getContext
    })

    await page.goto('/')

    await expect(page.getByRole('heading', homeHeading)).toBeVisible()
    await expect(page.locator('.hero-scene canvas')).toHaveCount(0)
    await expect(page.locator('.hero-scene .chakra-spinner')).toHaveCount(0)
  })
})
