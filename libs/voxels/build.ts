// Builds a voxel model from its text layout, in the browser. Only the faces
// between a voxel and empty space are kept, and each face is coloured from
// the palette.
import * as THREE from 'three'
import { buildClip } from './clips'
import { PALETTE, VOXEL, readVoxels, type Voxel } from './layout'
import type { ModelDef, VoxelPoint } from './types'

// A cube's six sides: which way each faces, and its corners in the order
// that makes it face outwards.
const FACES: { dir: VoxelPoint; corners: VoxelPoint[] }[] = [
  {
    dir: [1, 0, 0],
    corners: [
      [1, 0, 1],
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1]
    ]
  },
  {
    dir: [-1, 0, 0],
    corners: [
      [0, 0, 0],
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0]
    ]
  },
  {
    dir: [0, 1, 0],
    corners: [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
      [0, 1, 0]
    ]
  },
  {
    dir: [0, -1, 0],
    corners: [
      [0, 0, 0],
      [1, 0, 0],
      [1, 0, 1],
      [0, 0, 1]
    ]
  },
  {
    dir: [0, 0, 1],
    corners: [
      [0, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 1, 1]
    ]
  },
  {
    dir: [0, 0, -1],
    corners: [
      [1, 0, 0],
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 0]
    ]
  }
]

// One mesh for a set of voxels, with the faces that touch empty space.
// `offset` is subtracted from every voxel position, in voxels.
export function voxelMesh(
  voxels: Voxel[],
  offset: VoxelPoint,
  size: number,
  unlit = false
) {
  const filled = new Set(voxels.map(({ x, y, z }) => `${x},${y},${z}`))
  const positions: number[] = []
  const normals: number[] = []
  const colors: number[] = []
  const indices: number[] = []
  const color = new THREE.Color()
  for (const { x, y, z, letter } of voxels) {
    color.setHex(PALETTE[letter])
    for (const { dir, corners } of FACES) {
      if (filled.has(`${x + dir[0]},${y + dir[1]},${z + dir[2]}`)) continue
      const base = positions.length / 3
      for (const [cx, cy, cz] of corners) {
        positions.push(
          (x + cx - offset[0]) * size,
          (y + cy - offset[1]) * size,
          (z + cz - offset[2]) * size
        )
        normals.push(...dir)
        colors.push(color.r, color.g, color.b)
      }
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  )
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  return new THREE.Mesh(
    geometry,
    unlit
      ? new THREE.MeshBasicMaterial({ vertexColors: true })
      : new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.9,
          metalness: 0
        })
  )
}

// Builds a model: a group holding a "body" mesh and one mesh per part, each
// named after its part, with the clips that move them. The model is centred
// on x and z, and stands on y 0.
export function buildModel(def: ModelDef) {
  const { voxels, width, depth } = readVoxels(def.layout)
  const size = def.voxel ?? VOXEL
  const parts = Object.entries(def.parts ?? {})
  const centre: VoxelPoint = [width / 2, 0, depth / 2]

  const object = new THREE.Group()
  const body = voxelMesh(
    voxels.filter(
      v => !parts.some(([, part]) => part.letters.includes(v.letter))
    ),
    centre,
    size
  )
  body.name = 'body'
  object.add(body)
  for (const [name, { letters, pivot = centre, unlit }] of parts) {
    // Meshed around its pivot and then moved out to it, so turning the part
    // turns it about the pivot.
    const part = voxelMesh(
      voxels.filter(v => letters.includes(v.letter)),
      pivot,
      size,
      unlit
    )
    part.name = name
    part.position.set(
      (pivot[0] - centre[0]) * size,
      (pivot[1] - centre[1]) * size,
      (pivot[2] - centre[2]) * size
    )
    object.add(part)
  }

  return { object, clips: (def.animations ?? []).map(buildClip) }
}
