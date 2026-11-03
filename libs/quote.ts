// Quote of the day from ZenQuotes (https://zenquotes.io), fetched on the
// server when the home page is generated. The free API has no CORS headers,
// allows 5 requests per 30 seconds per IP, and requires an attribution link,
// which the page shows when `source` is 'zenquotes'.

export const ZENQUOTES_TODAY_URL = 'https://zenquotes.io/api/today'

export type Quote = {
  text: string
  author: string
  source: 'zenquotes' | 'fallback'
}

// Shown when ZenQuotes is unreachable, rate limited or returns something odd.
export const FALLBACK_QUOTE: Quote = {
  text: 'Be the change that you want to see in the world.',
  author: 'Mahatma Gandhi',
  source: 'fallback'
}

const MAX_LENGTH = 400

type ZenQuote = { q?: unknown; a?: unknown }

const clean = (value: unknown) =>
  typeof value === 'string' ? value.trim() : ''

export const parseZenQuotes = (data: unknown): Quote | null => {
  if (!Array.isArray(data) || data.length === 0) return null
  const { q, a } = data[0] as ZenQuote
  const text = clean(q)
  const author = clean(a)
  if (!text || !author || text.length > MAX_LENGTH) return null
  // When rate limited, ZenQuotes still answers 200 with its own message as
  // the "quote" ("Too many requests. Obtain an auth key...").
  if (author.toLowerCase() === 'zenquotes.io') return null
  return { text, author, source: 'zenquotes' }
}

export const fetchQuoteOfTheDay = async (
  fetchImpl: typeof fetch = fetch
): Promise<Quote> => {
  try {
    const res = await fetchImpl(ZENQUOTES_TODAY_URL, {
      signal: AbortSignal.timeout(5000)
    })
    if (!res.ok) throw new Error(`ZenQuotes answered ${res.status}`)
    const quote = parseZenQuotes(await res.json())
    if (!quote) throw new Error('ZenQuotes returned no usable quote')
    return quote
  } catch (err) {
    console.warn(`Using the fallback quote: ${(err as Error).message}`)
    return FALLBACK_QUOTE
  }
}
