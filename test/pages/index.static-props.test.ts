import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FALLBACK_QUOTE, type Quote } from '../../libs/quote'

const fetchQuoteOfTheDay = vi.fn<() => Promise<Quote>>()
vi.mock('../../libs/quote', async importOriginal => ({
  ...(await importOriginal<typeof import('../../libs/quote')>()),
  fetchQuoteOfTheDay: () => fetchQuoteOfTheDay()
}))

const {
  getStaticProps,
  QUOTE_REVALIDATE_SECONDS,
  FALLBACK_REVALIDATE_SECONDS
} = await import('../../pages/index')

describe('home page getStaticProps', () => {
  beforeEach(() => {
    fetchQuoteOfTheDay.mockReset()
  })

  it('passes the quote of the day and regenerates hourly', async () => {
    const quote: Quote = { text: 'Hi.', author: 'Me', source: 'zenquotes' }
    fetchQuoteOfTheDay.mockResolvedValue(quote)

    const result = await getStaticProps()

    expect(result.props.quote).toEqual(quote)
    expect(result.props.buildYear).toBe(new Date().getFullYear())
    expect(result.revalidate).toBe(QUOTE_REVALIDATE_SECONDS)
    expect(QUOTE_REVALIDATE_SECONDS).toBe(3600)
  })

  it('retries sooner after falling back', async () => {
    fetchQuoteOfTheDay.mockResolvedValue(FALLBACK_QUOTE)

    const result = await getStaticProps()

    expect(result.props.quote).toEqual(FALLBACK_QUOTE)
    expect(result.revalidate).toBe(FALLBACK_REVALIDATE_SECONDS)
    expect(FALLBACK_REVALIDATE_SECONDS).toBeLessThan(QUOTE_REVALIDATE_SECONDS)
  })
})
