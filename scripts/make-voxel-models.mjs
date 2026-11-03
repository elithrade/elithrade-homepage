// Builds the voxel dog scene's models from the text files in scripts/voxels/
// into public/models/voxel-dog/. Edit a .txt file, then run:
//
//   node scripts/make-voxel-models.mjs
//
// Each voxel is a cube VOXEL units wide. Only faces between a voxel and empty
// space are kept, and each face is coloured from the palette.
import { readFileSync, writeFileSync } from 'node:fs'
import * as THREE from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'

// GLTFExporter reads its output through the browser's FileReader.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buffer => {
      this.result = buffer
      this.onloadend?.()
    })
  }
}

const VOXEL = 0.1

const PALETTE = {
  B: 0xc0803f, // brown
  D: 0x6b4429, // dark brown
  W: 0xf5efe4, // white
  K: 0x2a211c, // black
  P: 0xe8797f, // pink
  R: 0xc8433a, // red
  G: 0xf0c03a, // gold
  L: 0x7fb661, // grass
  M: 0x6aa352, // darker grass
  N: 0x8a5a3b, // dirt
  E: 0xf2ead8, // bone
  F: 0xf5d04a, // yellow flower
  O: 0xf08fb0, // pink flower
  H: 0xe0c49a, // desk wood
  A: 0x3b4048, // dark grey: monitor, keyboard
  I: 0xc8cdd4, // keys
  T: 0xc4683f, // plant pot
  S: 0x1d2433, // screen
  X: 0xc678dd, // code: purple
  Y: 0x61afef, // code: blue
  Z: 0xe5c07b, // code: yellow
  V: 0x98c379, // code: green
  t: 0xc0803f, // tail, brown
  u: 0xf5efe4 // tail, white
}

const MODELS = [
  {
    name: 'dog',
    // The tail is its own node, turning about the middle of its lowest voxel,
    // so the "wag" clip can swing it side to side.
    parts: { tail: { letters: 'tu', pivot: [4.5, 5.5, 0.5] } },
    animations: [wag()]
  },
  {
    name: 'desk',
    // The screen is unlit, so it glows instead of being shaded.
    parts: { screen: { letters: 'SXYZV', unlit: true } }
  },
  { name: 'island' }
]

// Reads a layout: "y N" starts a layer, then one row per z and one
// character per x. Lines starting with # are comments.
function readVoxels(path) {
  const voxels = []
  let y = null
  let z = 0
  let size = null
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const row = line.trimEnd()
    if (row.startsWith('#')) continue
    const layer = row.match(/^y (-?\d+)$/)
    if (layer) {
      y = Number(layer[1])
      z = 0
      continue
    }
    if (!row) continue
    if (y === null) throw new Error(`${path}: voxels before the first layer`)
    size ??= row.length
    if (row.length !== size) throw new Error(`${path}: rows differ in length`)
    ;[...row].forEach((letter, x) => {
      if (letter === '.') return
      if (!(letter in PALETTE)) throw new Error(`${path}: unknown "${letter}"`)
      voxels.push({ x, y, z, letter })
    })
    z++
  }
  return voxels
}

const FACES = [
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
function voxelMesh(voxels, offset, unlit = false) {
  const filled = new Set(voxels.map(({ x, y, z }) => `${x},${y},${z}`))
  const positions = []
  const normals = []
  const colors = []
  const indices = []
  const color = new THREE.Color()
  for (const { x, y, z, letter } of voxels) {
    color.setHex(PALETTE[letter])
    for (const { dir, corners } of FACES) {
      if (filled.has(`${x + dir[0]},${y + dir[1]},${z + dir[2]}`)) continue
      const base = positions.length / 3
      for (const [cx, cy, cz] of corners) {
        positions.push(
          (x + cx - offset[0]) * VOXEL,
          (y + cy - offset[1]) * VOXEL,
          (z + cz - offset[2]) * VOXEL
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

// Swings the tail 25° either way about the dog's length, twice a second.
function wag() {
  const axis = new THREE.Vector3(0, 0, 1)
  const turn = degrees =>
    new THREE.Quaternion().setFromAxisAngle(axis, (degrees * Math.PI) / 180)
  const keys = [0, 25, 0, -25, 0].map(turn)
  return new THREE.AnimationClip('wag', 0.5, [
    new THREE.QuaternionKeyframeTrack(
      'tail.quaternion',
      [0, 0.125, 0.25, 0.375, 0.5],
      keys.flatMap(q => q.toArray())
    )
  ])
}

for (const { name, parts = {}, animations = [] } of MODELS) {
  const voxels = readVoxels(new URL(`voxels/${name}.txt`, import.meta.url))
  // Centre the model on x and z; y 0 is the ground.
  const width = Math.max(...voxels.map(v => v.x)) + 1
  const depth = Math.max(...voxels.map(v => v.z)) + 1
  const centre = [width / 2, 0, depth / 2]

  const root = new THREE.Group()
  root.name = name
  const rest = voxels.filter(
    v => !Object.values(parts).some(part => part.letters.includes(v.letter))
  )
  const body = voxelMesh(rest, centre)
  body.name = 'body'
  root.add(body)
  // A part without a pivot stays where it is, around the model's centre.
  for (const [partName, { letters, pivot = centre, unlit }] of Object.entries(
    parts
  )) {
    const part = voxelMesh(
      voxels.filter(v => letters.includes(v.letter)),
      pivot,
      unlit
    )
    part.name = partName
    part.position.set(...pivot.map((value, i) => (value - centre[i]) * VOXEL))
    root.add(part)
  }

  const scene = new THREE.Scene()
  scene.add(root)
  const glb = await new GLTFExporter().parseAsync(scene, {
    binary: true,
    animations
  })
  const out = new URL(`../public/models/voxel-dog/${name}.glb`, import.meta.url)
  writeFileSync(out, Buffer.from(glb))
  console.log(
    `${name}: ${voxels.length} voxels → ${out.pathname} (${glb.byteLength} bytes)`
  )
}
