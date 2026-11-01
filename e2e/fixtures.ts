import { test as base, expect } from '@playwright/test'

type Fixtures = {
  allowedErrors: RegExp[]
  pageErrors: string[]
}

// Every test fails if the page throws an uncaught error or logs a console
// error, so each spec doubles as a smoke test for runtime regressions.
// Specs that expect a particular error can allow it with
// `test.use({ allowedErrors: [/pattern/] })`.
export const test = base.extend<Fixtures>({
  allowedErrors: [[], { option: true }],
  pageErrors: [
    async ({ page, allowedErrors }, use) => {
      const errors: string[] = []
      const record = (text: string) => {
        if (!allowedErrors.some(re => re.test(text))) errors.push(text)
      }
      page.on('pageerror', err => record(`pageerror: ${err.message}`))
      page.on('response', res => {
        if (res.status() >= 400) record(`http ${res.status()}: ${res.url()}`)
      })
      page.on('console', msg => {
        // Failed requests are reported above with their URL; Chrome's own
        // "Failed to load resource" console message doesn't include it.
        if (msg.type() !== 'error') return
        if (msg.text().startsWith('Failed to load resource')) return
        record(`console: ${msg.text()}`)
      })
      await use(errors)
      expect(errors, 'unexpected browser errors').toEqual([])
    },
    { auto: true }
  ]
})

export { expect }
