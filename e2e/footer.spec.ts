import { test, expect } from './fixtures'
import { LINKEDIN_URL, SOURCE_URL, ZENQUOTES_URL } from '../components/footer'

test('footer is a page landmark with the copyright and links', async ({
  page
}) => {
  await page.goto('/works')

  const footer = page.getByRole('contentinfo')
  await expect(footer).toBeVisible()
  await expect(footer).toContainText(`© ${new Date().getFullYear()} Bin Hu`)
  for (const [name, href] of [
    ['LinkedIn', LINKEDIN_URL],
    ['Source on GitHub', SOURCE_URL]
  ]) {
    const link = footer.getByRole('link', { name })
    await expect(link).toHaveAttribute('href', href)
    await expect(link).toHaveAttribute('target', '_blank')
  }

  // Only pages with a quote credit ZenQuotes, and the footer sits outside
  // the main landmark, as does the navbar.
  await expect(footer.getByRole('link', { name: 'ZenQuotes' })).toHaveCount(0)
  await expect(page.getByRole('main').getByRole('contentinfo')).toHaveCount(0)
  await expect(page.getByRole('main').getByRole('navigation')).toHaveCount(0)
})

test('home page footer credits ZenQuotes when its quote came from there', async ({
  page
}) => {
  await page.goto('/')

  // The quote was fetched when the page was generated; if ZenQuotes was
  // unavailable it's the fallback, which needs no credit.
  const source = await page.evaluate(
    () =>
      (
        window as unknown as {
          __NEXT_DATA__: { props: { pageProps: { quote: { source: string } } } }
        }
      ).__NEXT_DATA__.props.pageProps.quote.source
  )
  const credit = page.getByRole('contentinfo').getByRole('link', {
    name: 'ZenQuotes'
  })
  if (source === 'zenquotes') {
    await expect(credit).toHaveAttribute('href', ZENQUOTES_URL)
  } else {
    await expect(credit).toHaveCount(0)
  }
})
