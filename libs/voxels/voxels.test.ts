import { describe, it, expect } from 'vitest'
import type { Mesh } from 'three'
import { LAYOUTS, type LayoutName } from './layouts'
import { readLayout, readVoxels } from './layout'
import { buildModel, voxelMesh } from './build'
import { buildClip } from './clips'

describe('readLayout', () => {
  it('reads layers from the bottom up, rows as z and characters as x', () => {
    const layout = readLayout(`
y 0
K.
.W

y 1
..
B.
`)
    expect(layout).toEqual({
      width: 2,
      depth: 2,
      voxels: [
        { x: 0, y: 0, z: 0, letter: 'K' },
        { x: 1, y: 0, z: 1, letter: 'W' },
        { x: 0, y: 1, z: 1, letter: 'B' }
      ]
    })
  })

  it('reads layers below the ground', () => {
    expect(readLayout('y -2\nN').voxels).toEqual([
      { x: 0, y: -2, z: 0, letter: 'N' }
    ])
  })

  it.each([
    ['a letter with no colour', 'y 0\n?', 'unknown letter "?"'],
    ['rows of different lengths', 'y 0\nKK\nK', 'rows differ in length'],
    ['voxels outside a layer', 'KK', 'voxels before the first layer']
  ])('rejects %s', (_case, text, message) => {
    expect(() => readLayout(text)).toThrow(message)
  })
})

describe.each(Object.keys(LAYOUTS) as LayoutName[])('layout %s', name => {
  it('reads, and has voxels', () => {
    const { voxels, width, depth } = readVoxels(name)
    expect(voxels.length).toBeGreaterThan(0)
    expect(width).toBeGreaterThan(0)
    expect(depth).toBeGreaterThan(0)
  })
})

describe('voxelMesh', () => {
  const corners = (mesh: Mesh) => mesh.geometry.getAttribute('position').count

  it('gives a lone voxel all six faces', () => {
    const mesh = voxelMesh([{ x: 0, y: 0, z: 0, letter: 'K' }], [0, 0, 0], 1)
    expect(corners(mesh)).toBe(6 * 4)
    expect(mesh.geometry.getIndex()!.count).toBe(6 * 6)
  })

  it('leaves out the faces between two voxels', () => {
    const mesh = voxelMesh(
      [
        { x: 0, y: 0, z: 0, letter: 'K' },
        { x: 1, y: 0, z: 0, letter: 'W' }
      ],
      [0, 0, 0],
      1
    )
    expect(corners(mesh)).toBe(10 * 4)
  })

  it('scales the voxels and moves them by the offset', () => {
    const mesh = voxelMesh([{ x: 2, y: 0, z: 0, letter: 'K' }], [1, 0, 0], 0.5)
    mesh.geometry.computeBoundingBox()
    const { min, max } = mesh.geometry.boundingBox!
    expect(min.toArray()).toEqual([0.5, 0, 0])
    expect(max.toArray()).toEqual([1, 0.5, 0.5])
  })
})

describe('buildModel', () => {
  it('centres the model on the ground', () => {
    const { object } = buildModel({ layout: 'desk' })
    const body = object.getObjectByName('body') as Mesh
    body.geometry.computeBoundingBox()
    const { min, max } = body.geometry.boundingBox!
    expect(min.x).toBeCloseTo(-max.x)
    expect(min.y).toBe(0)
  })

  it('splits a part off the body and stands it on its pivot', () => {
    const whole = buildModel({ layout: 'dog' })
    const split = buildModel({
      layout: 'dog',
      parts: { tail: { letters: 'tu', pivot: [4.5, 4.5, 2] } }
    })
    const count = (mesh?: object) =>
      (mesh as Mesh).geometry.getAttribute('position').count
    const tail = split.object.getObjectByName('tail')!

    expect(count(tail)).toBeGreaterThan(0)
    expect(count(split.object.getObjectByName('body'))).toBeLessThan(
      count(whole.object.getObjectByName('body'))
    )
    // The dog's layout is 9 voxels wide and 0.1 units a voxel, so x 4.5 is
    // its centre line.
    expect(tail.position.x).toBeCloseTo(0)
    expect(tail.position.y).toBeCloseTo(0.45)
  })
})

describe('the fly clip', () => {
  it('hovers over every flower on its island', () => {
    const island = readVoxels('island-me')
    const flowers = island.voxels.filter(v => 'FO'.includes(v.letter))
    const clip = buildClip({
      name: 'fly',
      island: 'island-me',
      radius: 1.6,
      height: 0.8
    })
    const path = clip.tracks.find(track => track.name === '.position')!

    expect(flowers.length).toBeGreaterThan(0)
    for (const flower of flowers) {
      const x = (flower.x + 0.5 - island.width / 2) * 0.1
      const z = (flower.z + 0.5 - island.depth / 2) * 0.1
      let closest = Infinity
      for (let i = 0; i < path.values.length; i += 3) {
        closest = Math.min(
          closest,
          Math.hypot(path.values[i] - x, path.values[i + 2] - z)
        )
      }
      expect(closest).toBeLessThan(0.001)
    }
  })

  it('ends where it starts, so it loops without a jump', () => {
    const clip = buildClip({
      name: 'fly',
      island: 'island',
      radius: 1.9,
      height: 0.5
    })
    const { values } = clip.tracks.find(track => track.name === '.position')!
    for (let axis = 0; axis < 3; axis++) {
      expect(values[values.length - 3 + axis]).toBeCloseTo(values[axis], 1)
    }
  })
})
