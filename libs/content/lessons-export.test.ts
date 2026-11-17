import { describe, it, expect } from 'vitest'
import { exportLessons, slugify } from './lessons-export'
import type { LessonProject } from './lessons'

const project: LessonProject = {
  id: 'demo',
  name: 'demo',
  description: 'A demo project.',
  source: 'https://example.com/LESSONS.md'
}

const md = (lines: string[]) => lines.join('\n')

const sample = md([
  '# Lessons learned',
  '',
  'Intro text before the first section is not exported.',
  '',
  '## 1. Concurrency and atomicity',
  '',
  '<details><summary>What does <code>Interlocked.Increment(ref x)</code> return?</summary>',
  '',
  'The new value, atomically.',
  'The trap is reading `x` again.',
  '',
  'Use the **returned** value.',
  '</details>',
  '',
  '## 2. Redis: `SET NX` and expiry',
  '',
  'Hands-on lab in a `redis:7` container.',
  '',
  '<details><summary>Why is <code>remaining &lt;= 0</code> dead code?</summary>',
  '',
  'Because `ExpiresAt - now` is always positive.',
  '</details>'
])

describe('exportLessons', () => {
  it('exports sections, cards and the project', () => {
    expect(exportLessons(sample, project)).toEqual({
      schemaVersion: 1,
      project,
      sections: [
        {
          n: 1,
          id: 'concurrency-and-atomicity',
          title: 'Concurrency and atomicity',
          intro: [],
          cards: [
            {
              id: 'what-does-interlocked-increment-ref-x-return',
              question: 'What does `Interlocked.Increment(ref x)` return?',
              answer: [
                'The new value, atomically. The trap is reading `x` again.',
                'Use the **returned** value.'
              ]
            }
          ]
        },
        {
          n: 2,
          id: 'redis-set-nx-and-expiry',
          title: 'Redis: `SET NX` and expiry',
          intro: ['Hands-on lab in a `redis:7` container.'],
          cards: [
            {
              id: 'why-is-remaining-0-dead-code',
              question: 'Why is `remaining <= 0` dead code?',
              answer: ['Because `ExpiresAt - now` is always positive.']
            }
          ]
        }
      ]
    })
  })

  it.each([
    [
      'a card before any section',
      md(['<details><summary>Q?</summary>', 'A.', '</details>']),
      /line 1: .*before the first section/
    ],
    [
      'a card that is never closed',
      md(['## 1. A', '<details><summary>Q?</summary>', 'A.', '## 2. B']),
      /line 4: .*not closed/
    ],
    ['a closing tag without a card', md(['## 1. A', '</details>']), /line 2: /],
    [
      'a summary split over lines',
      md(['## 1. A', '<details><summary>Q', '?</summary>', 'A.', '</details>']),
      /line 2: .*one line/
    ],
    [
      'a card without an answer',
      md(['## 1. A', '<details><summary>Q?</summary>', '</details>']),
      /line 3: .*no answer/
    ],
    [
      'a section without cards',
      md(['## 1. A', 'Only an intro.', '## 2. B']),
      /line 1: .*no cards/
    ],
    [
      'text after the cards of a section',
      md([
        '## 1. A',
        '<details><summary>Q?</summary>',
        'A.',
        '</details>',
        'Stray.'
      ]),
      /line 5: /
    ],
    ['a section heading without a number', md(['## A']), /line 1: .*numbered/],
    [
      'a list in an answer',
      md(['## 1. A', '<details><summary>Q?</summary>', '- one', '</details>']),
      /line 3: .*not supported/
    ],
    [
      'a code block in an answer',
      md(['## 1. A', '<details><summary>Q?</summary>', '```', '</details>']),
      /line 3: .*not supported/
    ],
    [
      'a link in an answer',
      md([
        '## 1. A',
        '<details><summary>Q?</summary>',
        'See [x](https://x.dev).',
        '</details>'
      ]),
      /line 3: .*not supported/
    ],
    [
      'two questions with the same id',
      md([
        '## 1. A',
        '<details><summary>Same?</summary>',
        'A.',
        '</details>',
        '## 2. B',
        '<details><summary>Same?</summary>',
        'B.',
        '</details>'
      ]),
      /line 6: .*same id/
    ]
  ])('rejects %s', (_, input, message) => {
    expect(() => exportLessons(input, project)).toThrow(message)
  })
})

describe('slugify', () => {
  it('keeps lowercase letters and digits, joined by single dashes', () => {
    expect(slugify('Redis: `SET NX`, TTL & p99?')).toBe('redis-set-nx-ttl-p99')
  })

  it('cuts long text at 60 characters without a trailing dash', () => {
    const slug = slugify('word '.repeat(20))
    expect(slug.length).toBeLessThanOrEqual(60)
    expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })
})
