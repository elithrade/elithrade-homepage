// A voxel model is plain data: which layout to mesh, how big its voxels are,
// which of them move on their own and how. build.ts turns one into three.js
// objects.
import type { LayoutName } from './layouts'

// A position in a layout, counted in voxels: [x, y, z].
export type VoxelPoint = [number, number, number]

// Some of a model's voxels, split off as a node of their own so they can
// move or be lit differently from the rest.
export type PartDef = {
  // The palette letters of the part's voxels.
  letters: string
  // The point the part turns about. Left out, it's the model's centre on the
  // ground.
  pivot?: VoxelPoint
  // Drawn at full brightness instead of being shaded, like a screen.
  unlit?: boolean
}

// A movement a model can loop. Each one moves parts by name, so the model
// needs those parts.
export type ClipDef =
  // Swings the "tail" part from side to side.
  | { name: 'wag' }
  // Taps the "armR" and "armL" parts up and down in turn.
  | { name: 'type' }
  // Flies the whole model in a loop round the flowers in an island's layout,
  // flapping "wingL" and "wingR". Between flowers it swings out to `radius`
  // from the island's centre, `height` above the ground.
  | { name: 'fly'; island: LayoutName; radius: number; height: number }

export type FlyDef = Extract<ClipDef, { name: 'fly' }>

export type ModelDef = {
  layout: LayoutName
  // The width of one voxel in world units. Left out, it's VOXEL in layout.ts.
  voxel?: number
  parts?: Record<string, PartDef>
  animations?: ClipDef[]
}
