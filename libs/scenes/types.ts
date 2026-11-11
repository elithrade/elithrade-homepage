// A hero scene is plain data: which models to load, where each copy goes,
// and how the camera and sun are set up. components/hero-scene.tsx renders
// any scene described this way.

// Where a model goes. Positions are in world units, with y up and z towards
// the viewer. `turn` rotates in degrees, anticlockwise seen from above,
// about the model's own origin. `scale` resizes a model built at a
// different scale.
export type Placement = {
  x: number
  z: number
  y?: number
  turn?: number
  scale?: number
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
  // Short name for the button that switches to this scene.
  label: string
  // Every model the scene loads, by id, and where to fetch it.
  models: Record<M, string>
  pieces: Piece<M>[]
  actors?: Actor<M>[]
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
    // turntable, until the visitor clicks or drags it. Without it the camera
    // rests at `azimuth`, and dragging can swing it at most 45° either way.
    turntable?: number
  }
  // Light strengths, relative to the defaults (1 = default). The fill is a
  // weak light from across the scene from the sun, which keeps the sides in
  // shadow from going dark.
  lights?: { ambient?: number; sun?: number; fill?: number }
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
