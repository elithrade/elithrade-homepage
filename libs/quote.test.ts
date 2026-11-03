import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  fetchQuoteOfTheDay,
  parseZenQuotes,
  FALLBACK_QUOTE,
  ZENQUOTES_TODAY_URL
} from './quote'

const today = [
  {
    q: 'When the time is gone, you can never get it back.',
    a: 'Stephen King',
    h: '<blockquote>...</blockquote>',
    date: '2026-11-03'
  }
]

const respond = (body: unknown, status = 200) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status }))

describe('parseZenQuotes', () => {
  it('reads the quote and author', () => {
    expect(parseZenQuotes(today)).toEqual({
      text: 'When the time is gone, you can never get it back.',
      author: 'Stephen King',
      source: 'zenquotes'
    })
  })

  it('trims whitespace', () => {
    expect(parseZenQuotes([{ q: '  Hi.  ', a: ' Me ' }])).toMatchObject({
      text: 'Hi.',
      author: 'Me'
    })
  })

  it.each([
    ['not an array', { q: 'x', a: 'y' }],
    ['an empty array', []],
    ['a missing author', [{ q: 'x' }]],
    ['an empty quote', [{ q: '  ', a: 'y' }]],
    ['non-string fields', [{ q: 1, a: 2 }]],
    ['an overly long quote', [{ q: 'x'.repeat(401), a: 'y' }]],
    [
      "ZenQuotes' rate-limit message",
      [
        {
          q: 'Too many requests. Obtain an auth key for unlimited access.',
          a: 'zenquotes.io'
        }
      ]
    ]
  ])('rejects %s', (_, data) => {
    expect(parseZenQuotes(data)).toBeNull()
  })
})

describe('fetchQuoteOfTheDay', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns today's quote from ZenQuotes", async () => {
    const fetchImpl = respond(today)

    await expect(fetchQuoteOfTheDay(fetchImpl)).resolves.toMatchObject({
      author: 'Stephen King',
      source: 'zenquotes'
    })
    expect(fetchImpl).toHaveBeenCalledWith(
      ZENQUOTES_TODAY_URL,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
  })

  it.each([
    ['an HTTP error', respond({}, 503)],
    ['an unusable body', respond({ nope: true })],
    [
      'a network failure',
      vi.fn(async () => {
        throw new TypeError('fetch failed')
      })
    ],
    ['invalid JSON', vi.fn(async () => new Response('<html>', { status: 200 }))]
  ])('falls back to the default quote on %s', async (_, fetchImpl) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await expect(fetchQuoteOfTheDay(fetchImpl)).resolves.toEqual(FALLBACK_QUOTE)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Using the fallback quote')
    )
  })
})
