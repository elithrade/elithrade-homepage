import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { SCENES, HERO_SCENE } from '.'
import type { SceneDef } from './types'

type GlbJson = {
  images?: { uri?: string; bufferView?: number }[]
  animations?: { name?: string }[]
}

// Reads the JSON chunk of a binary glTF file.
function readGlbJson(path: string) {
  const data = readFileSync(path)
  expect(data.toString('ascii', 0, 4)).toBe('glTF')
  const length = data.readUInt32LE(12)
  return JSON.parse(data.toString('utf8', 20, 20 + length)) as GlbJson
}

function usedModels(scene: SceneDef) {
  const used = new Set<string>()
  for (const piece of scene.pieces) used.add(piece.model)
  for (const actor of scene.actors ?? []) used.add(actor.model)
  return used
}

describe.each(SCENES.map(scene => [scene.name, scene] as const))(
  'scene %s',
  (_name, scene: SceneDef) => {
    it('uses every model it loads, so no file is fetched for nothing', () => {
      expect([...usedModels(scene)].sort()).toEqual(
        Object.keys(scene.models).sort()
      )
    })

    it('loads each model from its own folder under public/models', () => {
      for (const url of Object.values(scene.models)) {
        expect(url).toMatch(new RegExp(`^/models/${scene.name}/[\\w-]+\\.glb$`))
      }
    })

    it.each(Object.entries(scene.models))(
      'ships %s as one self-contained .glb',
      (_id, url) => {
        const json = readGlbJson(join('public', url))

        // Textures must be embedded: an external image would 404 on the site.
        for (const image of json.images ?? []) {
          expect(image.uri).toBeUndefined()
          expect(image.bufferView).toBeTypeOf('number')
        }
      }
    )

    it('plays only animations its models have', () => {
      for (const actor of scene.actors ?? []) {
        if (!actor.animation) continue
        const json = readGlbJson(join('public', scene.models[actor.model]))
        expect(json.animations?.map(clip => clip.name)).toContain(
          actor.animation
        )
      }
    })
  }
)

describe('scenes', () => {
  it('have unique names', () => {
    const names = SCENES.map(scene => scene.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('include the one shown on the homepage', () => {
    expect(SCENES).toContain(HERO_SCENE)
  })
})
