import { describe, it, expect } from 'vitest'
import { PropertyBinding, type Mesh } from 'three'
import { SCENES, HERO_SCENE } from '.'
import type { SceneDef } from './types'
import { buildModel } from '../voxels/build'

function usedModels(scene: SceneDef) {
  const used = new Set<string>()
  for (const piece of scene.pieces) used.add(piece.model)
  for (const actor of scene.actors ?? []) used.add(actor.model)
  return used
}

describe.each(SCENES.map(scene => [scene.name, scene] as const))(
  'scene %s',
  (_name, scene: SceneDef) => {
    it('uses every model it describes', () => {
      expect([...usedModels(scene)].sort()).toEqual(
        Object.keys(scene.models).sort()
      )
    })

    describe.each(Object.entries(scene.models))('model %s', (_id, model) => {
      const { object, clips } = buildModel(model)

      it('has voxels in its body and in every part', () => {
        expect(object.children.map(mesh => mesh.name)).toEqual([
          'body',
          ...Object.keys(model.parts ?? {})
        ])
        object.traverse(node => {
          if (node === object) return
          const { geometry } = node as Mesh
          expect(geometry.getAttribute('position').count).toBeGreaterThan(0)
        })
      })

      it('only animates itself and its own parts', () => {
        for (const clip of clips) {
          expect(clip.duration).toBeGreaterThan(0)
          for (const track of clip.tracks) {
            const { nodeName } = PropertyBinding.parseTrackName(track.name)
            // No name means the model as a whole.
            if (nodeName)
              expect(Object.keys(model.parts ?? {})).toContain(nodeName)
          }
        }
      })
    })

    it('plays only animations its models have', () => {
      for (const actor of scene.actors ?? []) {
        if (!actor.animation) continue
        const animations = scene.models[actor.model].animations ?? []
        expect(animations.map(clip => clip.name)).toContain(actor.animation)
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
