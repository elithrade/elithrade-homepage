import { describe, it, expect } from 'vitest'
import { FUGRO, RACWA, getWork, organisations, works, worksFor } from './works'

describe('works data', () => {
  it('has unique, URL-safe ids', () => {
    const ids = works.map(work => work.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('gives every work a title, summary and at least one highlight', () => {
    for (const work of works) {
      expect(work.title.trim(), work.id).not.toBe('')
      expect(work.summary.trim(), work.id).not.toBe('')
      expect(work.highlights.length, work.id).toBeGreaterThan(0)
    }
  })

  it('only uses known organisations', () => {
    for (const work of works) {
      expect(organisations, work.id).toContain(work.organisation)
    }
  })

  it('has no duplicate technologies within a work', () => {
    for (const work of works) {
      expect(new Set(work.stack).size, work.id).toBe(work.stack.length)
    }
  })
})

describe('getWork', () => {
  it('finds a work by id', () => {
    expect(getWork('rov-video-streaming')?.organisation).toBe(FUGRO)
  })

  it('returns undefined for an unknown id', () => {
    expect(getWork('nope')).toBeUndefined()
  })
})

describe('worksFor', () => {
  it('splits every work between the organisations, in order', () => {
    const racwa = worksFor(RACWA)
    const fugro = worksFor(FUGRO)
    expect(racwa.length).toBeGreaterThan(0)
    expect(fugro.length).toBeGreaterThan(0)
    expect([...racwa, ...fugro]).toEqual(works)
  })
})
