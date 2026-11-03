// The hero scene: a small ruined arena built from Kenney's "Mini Arena" pack
// (CC0, https://kenney.nl), loosely recreating the pack's sample image.
//
// Every model is a piece on a 1×1 grid with its base at y = 0. Positions are
// in tiles: x runs left to right, z from the back (-3) to the front (+2),
// and y lifts a piece onto another one. `turn` rotates it in degrees,
// anticlockwise seen from above.

export const ARENA_MODELS = [
  'banner',
  'block',
  'border-corner',
  'border-straight',
  'bricks',
  'character-soldier',
  'column',
  'column-damaged',
  'floor',
  'floor-detail',
  'stairs',
  'statue',
  'tree',
  'trophy',
  'wall',
  'wall-corner',
  'wall-gate',
  'weapon-rack',
  'weapon-spear'
] as const

export type ArenaModel = (typeof ARENA_MODELS)[number]

export const arenaModelUrl = (model: ArenaModel) => `/models/arena/${model}.glb`

export type Piece = {
  model: ArenaModel
  x: number
  z: number
  y?: number
  turn?: number
}

export type Soldier = Omit<Piece, 'model'> & {
  animation: string
  spear?: boolean
}

// Tiles left out of the floor to give it ragged edges.
const MISSING_TILES = new Set(['-4,2', '4,2', '-4,-3', '3,2', '4,-3'])
// Tiles with pebbles on them.
const DETAIL_TILES = new Set([
  '-2,0',
  '1,1',
  '3,0',
  '-1,-2',
  '0,2',
  '-3,-1',
  '2,-2',
  '-1,1'
])

function floor(): Piece[] {
  const tiles: Piece[] = []
  for (let x = -4; x <= 4; x++) {
    for (let z = -3; z <= 2; z++) {
      const key = `${x},${z}`
      if (MISSING_TILES.has(key)) continue
      tiles.push({
        model: DETAIL_TILES.has(key) ? 'floor-detail' : 'floor',
        x,
        z
      })
    }
  }
  // A few loose slabs lying off the edge, slightly askew.
  tiles.push(
    { model: 'floor', x: -3.3, z: 2.8, turn: 8 },
    { model: 'floor', x: 2.4, z: 3.2, turn: -6 },
    { model: 'floor', x: 5.3, z: 0.6, turn: 12 },
    { model: 'floor', x: 4.6, z: -4.1, turn: -10 }
  )
  return tiles
}

export const PIECES: Piece[] = [
  ...floor(),

  // Purple wall along the back, with a barred gate in the middle.
  { model: 'wall-corner', x: -2, z: -3, turn: 0 },
  { model: 'wall', x: -1, z: -3 },
  { model: 'wall-gate', x: 0, z: -3 },
  { model: 'wall', x: 1, z: -3 },
  { model: 'wall-corner', x: 2, z: -3, turn: -90 },

  // Ruined colonnade on the left: slabs resting on two columns.
  { model: 'column', x: -4, z: -2 },
  { model: 'column', x: -2, z: -2 },
  { model: 'border-straight', x: -4, z: -2, y: 1 },
  { model: 'border-straight', x: -3, z: -2, y: 1 },
  { model: 'border-straight', x: -2, z: -2, y: 1 },
  { model: 'bricks', x: -4.2, z: -1.1 },
  { model: 'bricks', x: -3.3, z: -1.4, turn: 40 },

  // Stepped platform on the right, with a column and curved slab on top.
  { model: 'block', x: 3, z: -3 },
  { model: 'block', x: 4, z: -3 },
  { model: 'block', x: 3, z: -2 },
  { model: 'block', x: 4, z: -2 },
  { model: 'block', x: 3, z: -3, y: 0.5 },
  { model: 'block', x: 4, z: -3, y: 0.5 },
  { model: 'stairs', x: 3, z: -2, y: 0.5 },
  { model: 'stairs', x: 4, z: -2, y: 0.5 },
  { model: 'stairs', x: 3, z: -1 },
  { model: 'stairs', x: 4, z: -1 },
  { model: 'column', x: 4, z: -3, y: 1 },
  { model: 'border-corner', x: 4, z: -3, y: 2, turn: 180 },

  // The middle: the trophy on its pedestal, a broken column, a banner.
  { model: 'column', x: 0, z: -1 },
  { model: 'trophy', x: 0, z: -1, y: 1 },
  { model: 'column-damaged', x: 1.2, z: 0.4 },
  { model: 'banner', x: 2, z: -1.2 },
  { model: 'bricks', x: 2.2, z: 0.2, turn: -20 },

  // Trees, the statue and the weapon rack.
  { model: 'tree', x: -3, z: 0 },
  { model: 'tree', x: -2.3, z: 0.7 },
  { model: 'tree', x: 1.3, z: -2.2 },
  { model: 'statue', x: 0, z: 1.5 },
  { model: 'weapon-rack', x: -2, z: 1.4, turn: 20 }
]

export const SOLDIERS: Soldier[] = [
  { x: -3.6, z: 1.4, turn: 60, animation: 'idle', spear: true },
  { x: 0.7, z: -3, y: 1, turn: 0, animation: 'sit', spear: true },
  { x: 3, z: 1.4, turn: -40, animation: 'idle' }
]
