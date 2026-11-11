// Reads the text layouts voxel models are drawn in, and holds the colour
// each letter stands for.
import { LAYOUTS, type LayoutName } from './layouts'

// The width of one voxel in world units, unless a model sets its own.
export const VOXEL = 0.1

export const PALETTE: Record<string, number> = {
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

export type Voxel = { x: number; y: number; z: number; letter: string }

// Reads a layout: "y N" starts a layer, then one row per z and one
// character per x. Returns the voxels and the size of a layer: `width`
// characters by `depth` rows.
export function readLayout(text: string) {
  const voxels: Voxel[] = []
  let y: number | null = null
  let z = 0
  let width: number | null = null
  for (const line of text.split('\n')) {
    const row = line.trimEnd()
    const layer = row.match(/^y (-?\d+)$/)
    if (layer) {
      y = Number(layer[1])
      z = 0
      continue
    }
    if (!row) continue
    if (y === null) throw new Error('voxels before the first layer')
    width ??= row.length
    if (row.length !== width) throw new Error(`rows differ in length: "${row}"`)
    for (const [x, letter] of [...row].entries()) {
      if (letter === '.') continue
      if (!(letter in PALETTE)) throw new Error(`unknown letter "${letter}"`)
      voxels.push({ x, y, z, letter })
    }
    z++
  }
  return { voxels, width: width ?? 0, depth: z }
}

export function readVoxels(layout: LayoutName) {
  try {
    return readLayout(LAYOUTS[layout])
  } catch (err) {
    throw new Error(`layout ${layout}: ${(err as Error).message}`)
  }
}
