// Builds the voxel scenes' models from the text files in scripts/voxels/
// into public/models/<scene>/ (see SCENES below). Edit a .txt file, then run:
//
//   node scripts/make-voxel-models.mjs
//
// Each voxel is a cube VOXEL units wide, unless a model sets its own size.
// Only faces between a voxel and empty space are kept, and each face is
// coloured from the palette.
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
  C: 0xf0dcb8, // cream
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
  J: 0x4caf7d, // green keys
  T: 0xc4683f, // plant pot
  S: 0x1d2433, // screen
  X: 0xc678dd, // code: purple
  Y: 0x61afef, // code: blue
  Z: 0xe5c07b, // code: yellow
  V: 0x98c379, // code: green
  U: 0xf5c22a, // bee yellow
  t: 0xc0803f, // tail, brown
  u: 0xf5efe4, // tail, white
  q: 0xe6f2ff, // bee wing, left
  r: 0xe6f2ff, // bee wing, right
  // The avatar.
  h: 0x7a3a1f, // hair and beard
  b: 0x4e2414, // mouth
  s: 0xf2b08c, // skin
  n: 0xe0967a, // nose
  g: 0x6f6880, // suit grey
  k: 0x3f3849, // suit dark grey
  o: 0xf28c28, // suit orange
  d: 0xc8571b, // chest emblem, dark orange
  y: 0xffd25a, // chest emblem, yellow
  c: 0x58516a, // crowbar
  e: 0x6f6880, // right arm, grey
  l: 0xf28c28, // right arm, orange
  f: 0x3f3849, // right glove
  i: 0x6f6880, // left arm, grey
  m: 0xf28c28, // left arm, orange
  j: 0x3f3849 // left glove
}

// The screen is unlit, so it glows instead of being shaded.
const DESK = {
  name: 'desk',
  parts: { screen: { letters: 'SXYZV', unlit: true } }
}

// Each wing turns about the line along the top of the bee's back. Its flight
// path is worked out from the flowers on the island it flies round.
const bee = flight => ({
  name: 'bee',
  voxel: 0.03,
  parts: {
    wingL: { letters: 'q', pivot: [2.5, 3, 4] },
    wingR: { letters: 'r', pivot: [2.5, 3, 4] }
  },
  animations: [beeFlight(flight)]
})

// The models of each scene, built into public/models/<scene>/<name>.glb from
// scripts/voxels/<layout>.txt (the layout defaults to the model's name).
const SCENES = {
  'voxel-dog': [
    {
      name: 'dog',
      // The tail is its own node, turning where it meets the dog's back, so
      // the "wag" clip can swing it side to side.
      parts: { tail: { letters: 'tu', pivot: [4.5, 4.5, 2] } },
      animations: [wag()]
    },
    DESK,
    { name: 'island' },
    bee({ island: 'island', radius: 1.3, height: 0.5 })
  ],
  'voxel-me': [
    {
      name: 'avatar',
      // Smaller voxels than the dog's, so its hands come level with the keys.
      voxel: 0.08,
      // Each arm turns at the shoulder, so the "type" clip can tap the keys.
      parts: {
        armR: { letters: 'elf', pivot: [2, 11, 3] },
        armL: { letters: 'imj', pivot: [12, 11, 3] }
      },
      animations: [type()]
    },
    {
      name: 'dog',
      layout: 'dog-napping',
      // The tail turns where it meets the dog's rump, so the "wag" clip
      // swings it from side to side along the ground.
      parts: { tail: { letters: 'tu', pivot: [3.5, 1.5, 2] } },
      animations: [wag()]
    },
    DESK,
    { name: 'island', layout: 'island-me' },
    // Higher and a little wider than in voxel-dog, so it flies over the
    // napping dog and stays clear of the desk.
    bee({ island: 'island-me', radius: 1.4, height: 0.8 })
  ]
}

// Reads a layout: "y N" starts a layer, then one row per z and one
// character per x. Lines starting with # are comments. Returns the voxels
// and the size of a layer: `width` characters by `depth` rows.
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
  return { voxels, width: size, depth: z }
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
function voxelMesh(voxels, offset, size, unlit = false) {
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

// Swings the tail 25° either way about the vertical, twice a second.
function wag() {
  const axis = new THREE.Vector3(0, 1, 0)
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

// Taps the keys: each arm lifts its hand a little and drops it again, in
// turn, about three times a second.
function type() {
  const axis = new THREE.Vector3(1, 0, 0)
  const lift = degrees =>
    new THREE.Quaternion()
      .setFromAxisAngle(axis, (-degrees * Math.PI) / 180)
      .toArray()
  const times = [0, 0.15, 0.3, 0.45, 0.6]
  const track = (part, keys) =>
    new THREE.QuaternionKeyframeTrack(
      `${part}.quaternion`,
      times,
      keys.flatMap(lift)
    )
  return new THREE.AnimationClip('type', 0.6, [
    track('armR', [0, 7, 0, 0, 0]),
    track('armL', [0, 0, 0, 7, 0])
  ])
}

// Flies a loop round the island: out to `radius` from its centre at
// `height`, then in to hover over each flower in the island's layout in
// turn, bobbing and flapping all the way. The path follows the flowers, so
// it changes when they're moved.
function beeFlight({ island: layout, radius, height }) {
  const CRUISE_RADIUS = radius
  const CRUISE_HEIGHT = height
  const SPEED = 0.6 // units per second
  const HOVER = 0.8 // seconds over each flower

  const island = readVoxels(new URL(`voxels/${layout}.txt`, import.meta.url))
  const flowers = island.voxels
    .filter(v => 'FO'.includes(v.letter))
    .map(v => ({
      x: (v.x + 0.5 - island.width / 2) * VOXEL,
      z: (v.z + 0.5 - island.depth / 2) * VOXEL,
      top: (v.y + 1) * VOXEL,
      angle: Math.atan2(
        v.z + 0.5 - island.depth / 2,
        v.x + 0.5 - island.width / 2
      )
    }))
    .sort((a, b) => a.angle - b.angle)

  // Two points just above each flower (the hover), then one out at the
  // edge halfway round to the next flower.
  const points = []
  const durations = []
  flowers.forEach((flower, i) => {
    const next = flowers[(i + 1) % flowers.length]
    const gap = (next.angle - flower.angle + 2 * Math.PI) % (2 * Math.PI)
    const out = flower.angle + gap / 2
    points.push(
      new THREE.Vector3(flower.x, flower.top + 0.1, flower.z),
      new THREE.Vector3(flower.x, flower.top + 0.14, flower.z),
      new THREE.Vector3(
        CRUISE_RADIUS * Math.cos(out),
        CRUISE_HEIGHT,
        CRUISE_RADIUS * Math.sin(out)
      )
    )
  })
  for (let i = 0; i < points.length; i++) {
    const distance = points[i].distanceTo(points[(i + 1) % points.length])
    durations.push(i % 3 === 0 ? HOVER : distance / SPEED)
  }

  const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal')
  const times = []
  const positions = []
  const turns = []
  const up = new THREE.Vector3(0, 1, 0)
  let time = 0
  let heading = 0
  for (let i = 0; i <= points.length; i++) {
    const steps =
      i < points.length ? Math.max(4, Math.ceil(durations[i] / 0.1)) : 1
    for (let step = 0; step < steps; step++) {
      const t = ((i + step / steps) / points.length) % 1
      const point = curve.getPoint(t)
      // Face the way it's flying, but keep its heading while it hovers.
      const tangent = curve.getTangent(t)
      if (Math.hypot(tangent.x, tangent.z) > 0.2) {
        heading = Math.atan2(tangent.x, tangent.z)
      }
      times.push(time)
      positions.push(
        point.x,
        point.y + 0.012 * Math.sin(time * 2 * Math.PI * 3),
        point.z
      )
      turns.push(
        ...new THREE.Quaternion().setFromAxisAngle(up, heading).toArray()
      )
      if (i === points.length) break
      time += durations[i] / steps
    }
  }

  // Wings beat about twelve times a second, both up together.
  const beats = Math.round(time * 12)
  const forward = new THREE.Vector3(0, 0, 1)
  const wingTimes = []
  const left = []
  const right = []
  for (let i = 0; i <= beats * 2; i++) {
    const angle = ((i % 2 === 0 ? 40 : -10) * Math.PI) / 180
    wingTimes.push((i * time) / (beats * 2))
    left.push(
      ...new THREE.Quaternion().setFromAxisAngle(forward, -angle).toArray()
    )
    right.push(
      ...new THREE.Quaternion().setFromAxisAngle(forward, angle).toArray()
    )
  }

  return new THREE.AnimationClip('fly', time, [
    new THREE.VectorKeyframeTrack('bee.position', times, positions),
    new THREE.QuaternionKeyframeTrack('bee.quaternion', times, turns),
    new THREE.QuaternionKeyframeTrack('wingL.quaternion', wingTimes, left),
    new THREE.QuaternionKeyframeTrack('wingR.quaternion', wingTimes, right)
  ])
}

const builds = Object.entries(SCENES).flatMap(([scene, models]) =>
  models.map(model => ({ scene, ...model }))
)
for (const {
  scene: sceneName,
  name,
  layout = name,
  voxel = VOXEL,
  parts = {},
  animations = []
} of builds) {
  const { voxels, width, depth } = readVoxels(
    new URL(`voxels/${layout}.txt`, import.meta.url)
  )
  // Centre the model on x and z; y 0 is the ground.
  const centre = [width / 2, 0, depth / 2]

  const root = new THREE.Group()
  root.name = name
  const rest = voxels.filter(
    v => !Object.values(parts).some(part => part.letters.includes(v.letter))
  )
  const body = voxelMesh(rest, centre, voxel)
  body.name = 'body'
  root.add(body)
  // A part without a pivot stays where it is, around the model's centre.
  for (const [partName, { letters, pivot = centre, unlit }] of Object.entries(
    parts
  )) {
    const part = voxelMesh(
      voxels.filter(v => letters.includes(v.letter)),
      pivot,
      voxel,
      unlit
    )
    part.name = partName
    part.position.set(...pivot.map((value, i) => (value - centre[i]) * voxel))
    root.add(part)
  }

  const scene = new THREE.Scene()
  scene.add(root)
  const glb = await new GLTFExporter().parseAsync(scene, {
    binary: true,
    animations
  })
  const out = new URL(
    `../public/models/${sceneName}/${name}.glb`,
    import.meta.url
  )
  writeFileSync(out, Buffer.from(glb))
  console.log(
    `${sceneName}/${name}: ${voxels.length} voxels → ${out.pathname} (${glb.byteLength} bytes)`
  )
}
