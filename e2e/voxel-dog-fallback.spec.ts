import { test, expect } from './fixtures'

const homeHeading = { level: 2, name: 'Bin Hu' } as const

test.describe('when the dog model fails to load', () => {
  test.use({ allowedErrors: [/^http 404: .*\/dog\.glb$/] })

  test('stops the spinner and keeps the page working', async ({ page }) => {
    await page.route('**/dog.glb', route => route.fulfill({ status: 404 }))

    await page.goto('/')

    await expect(page.getByRole('heading', homeHeading)).toBeVisible()
    await expect(page.locator('.voxel-dog .chakra-spinner')).toHaveCount(0, {
      timeout: 15_000
    })
  })
})

test.describe('when WebGL is unavailable', () => {
  // three.js logs its own console error when it can't create a context.
  test.use({ allowedErrors: [/^console: .*WebGL/] })

  test('renders the page without the dog', async ({ page }) => {
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
    await expect(page.locator('.voxel-dog canvas')).toHaveCount(0)
    await expect(page.locator('.voxel-dog .chakra-spinner')).toHaveCount(0)
  })
})
