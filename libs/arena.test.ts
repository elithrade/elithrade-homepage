import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ARENA_MODELS, PIECES, SOLDIERS, arenaModelUrl } from './arena'

// Reads the JSON chunk of a binary glTF file.
function readGlbJson(path: string) {
  const data = readFileSync(path)
  expect(data.toString('ascii', 0, 4)).toBe('glTF')
  const length = data.readUInt32LE(12)
  return JSON.parse(data.toString('utf8', 20, 20 + length)) as {
    images?: { uri?: string; bufferView?: number }[]
  }
}

describe('arena layout', () => {
  it('uses every model it loads, so no file is fetched for nothing', () => {
    const used = new Set<string>(PIECES.map(piece => piece.model))
    used.add('character-soldier')
    if (SOLDIERS.some(soldier => soldier.spear)) used.add('weapon-spear')

    expect([...used].sort()).toEqual([...ARENA_MODELS].sort())
  })

  it('never stacks two floor tiles on the same spot', () => {
    const spots = PIECES.filter(p => p.model.startsWith('floor')).map(
      p => `${p.x},${p.z}`
    )

    expect(new Set(spots).size).toBe(spots.length)
  })

  it.each(ARENA_MODELS)('ships %s as one self-contained .glb', model => {
    const json = readGlbJson(join('public', arenaModelUrl(model)))

    // Textures must be embedded: an external image would 404 on the site.
    for (const image of json.images ?? []) {
      expect(image.uri).toBeUndefined()
      expect(image.bufferView).toBeTypeOf('number')
    }
  })
})
