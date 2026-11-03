// A hero scene is plain data: which models to load, where each copy goes,
// and how the camera and sun are set up. components/hero-scene.tsx renders
// any scene described this way.

// Where a model goes. Positions are in world units (for Kenney packs, one
// unit is one floor tile), with y up and z towards the viewer. `turn`
// rotates in degrees, anticlockwise seen from above, about the model's own
// origin. `scale` resizes models from packs built at a different scale, or
// per axis ([x, y, z], before turning) to stretch a plain piece to fit.
export type Placement = {
  x: number
  z: number
  y?: number
  turn?: number
  scale?: number | readonly [number, number, number]
}

export type Piece<M extends string = string> = Placement & {
  model: M
}

// An animated character. `animation` names one of the model's clips, played
// on a loop.
export type Actor<M extends string = string> = Piece<M> & {
  animation?: string
}

export type SceneDef<M extends string = string> = {
  name: string
  // Every model the scene loads, by id, and where to fetch it.
  models: Record<M, string>
  pieces: Piece<M>[]
  actors?: Actor<M>[]
  // Some packs (like Kenney's Furniture Kit) ship flat, unlit colours. This
  // swaps them for lit materials so the scene gets shading and shadows.
  lightUnlitMaterials?: boolean
  camera: {
    // The point the camera looks at and orbits around.
    target: [number, number, number]
    // Resting direction: degrees around from straight in front (+z), with
    // positive to the right, and height and distance from the target.
    azimuth: number
    height: number
    distance: number
    // Half the visible width in world units; the visible height follows the
    // canvas's aspect ratio.
    halfWidth: number
    // Seconds per turn, to keep circling the scene after the intro like a
    // turntable. Without it the camera rests at `azimuth`, and dragging can
    // swing it at most 45° either way.
    turntable?: number
  }
  // Light strengths, relative to the defaults (1 = default).
  lights?: { ambient?: number; sun?: number }
  sun: {
    // Relative to the camera target.
    position: [number, number, number]
    // Half the size of the square the sun casts shadows over.
    shadowExtent: number
  }
}

// Identity helper that checks a scene definition while keeping its model ids
// as a literal union, so a typo in a piece's model is a type error.
export function defineScene<const M extends string>(
  scene: SceneDef<M>
): SceneDef<M> {
  return scene
}
