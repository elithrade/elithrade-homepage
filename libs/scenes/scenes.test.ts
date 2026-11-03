import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Box3, Matrix4, Quaternion, Vector3 } from 'three'
import { SCENES, HERO_SCENE } from '.'
import { devCorner, ROOM_INTERIOR, STRUCTURE } from './dev-corner'
import type { Placement, SceneDef } from './types'

type GlbNode = {
  mesh?: number
  children?: number[]
  matrix?: number[]
  translation?: [number, number, number]
  rotation?: [number, number, number, number]
  scale?: [number, number, number]
}

type GlbJson = {
  images?: { uri?: string; bufferView?: number }[]
  scenes: { nodes: number[] }[]
  nodes: GlbNode[]
  meshes: { primitives: { attributes: { POSITION: number } }[] }[]
  accessors: { min?: number[]; max?: number[] }[]
}

// Reads the JSON chunk of a binary glTF file.
function readGlbJson(path: string) {
  const data = readFileSync(path)
  expect(data.toString('ascii', 0, 4)).toBe('glTF')
  const length = data.readUInt32LE(12)
  return JSON.parse(data.toString('utf8', 20, 20 + length)) as GlbJson
}

// A model's x/z extent: its vertex position bounds, moved by every node's
// transform on the way down from the scene root.
function modelFootprint(url: string) {
  const json = readGlbJson(join('public', url))
  const box = new Box3()
  const visit = (index: number, parent: Matrix4) => {
    const node = json.nodes[index]
    const local = node.matrix
      ? new Matrix4().fromArray(node.matrix)
      : new Matrix4().compose(
          new Vector3(...(node.translation ?? [0, 0, 0])),
          new Quaternion(...(node.rotation ?? [0, 0, 0, 1])),
          new Vector3(...(node.scale ?? [1, 1, 1]))
        )
    const world = parent.clone().multiply(local)
    for (const { attributes } of node.mesh === undefined
      ? []
      : json.meshes[node.mesh].primitives) {
      const { min, max } = json.accessors[attributes.POSITION]
      if (!min || !max) continue
      box.union(
        new Box3(new Vector3(...min), new Vector3(...max)).applyMatrix4(world)
      )
    }
    for (const child of node.children ?? []) visit(child, world)
  }
  for (const root of json.scenes[0].nodes) visit(root, new Matrix4())
  return { minX: box.min.x, maxX: box.max.x, minZ: box.min.z, maxZ: box.max.z }
}

// Where a placed model's corners end up on the floor, after its turn
// (three.js rotation about y) and scale.
function placedCorners(
  footprint: ReturnType<typeof modelFootprint>,
  { x, z, turn = 0, scale = 1 }: Placement
) {
  const angle = (turn * Math.PI) / 180
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)]
  const [sx, , sz] = typeof scale === 'number' ? [scale, scale, scale] : scale
  return [
    [footprint.minX, footprint.minZ],
    [footprint.minX, footprint.maxZ],
    [footprint.maxX, footprint.minZ],
    [footprint.maxX, footprint.maxZ]
  ].map(([cx, cz]) => ({
    x: x + sx * cx * cos + sz * cz * sin,
    z: z - sx * cx * sin + sz * cz * cos
  }))
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

describe('dev corner', () => {
  const furniture = [...devCorner.pieces, ...(devCorner.actors ?? [])].filter(
    piece => !STRUCTURE.includes(piece.model)
  )
  const EPSILON = 1e-3

  it.each(furniture.map(piece => [piece.model, piece] as const))(
    'keeps %s inside the room, clear of the walls and window frame',
    (model, piece) => {
      const corners = placedCorners(
        modelFootprint(devCorner.models[model]),
        piece
      )
      const { window } = ROOM_INTERIOR
      for (const { x, z } of corners) {
        expect(x).toBeGreaterThanOrEqual(ROOM_INTERIOR.minX - EPSILON)
        expect(x).toBeLessThanOrEqual(ROOM_INTERIOR.maxX + EPSILON)
        expect(z).toBeGreaterThanOrEqual(ROOM_INTERIOR.minZ - EPSILON)
        expect(z).toBeLessThanOrEqual(ROOM_INTERIOR.maxZ + EPSILON)
      }
      const xs = corners.map(c => c.x)
      const inFrontOfWindow =
        Math.max(...xs) > window.minX && Math.min(...xs) < window.maxX
      if (inFrontOfWindow) {
        for (const { z } of corners) {
          expect(z).toBeGreaterThanOrEqual(window.minZ - EPSILON)
        }
      }
    }
  )
})
