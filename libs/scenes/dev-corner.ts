// A developer's corner: desk, two monitors, a tower under the desk, coffee,
// books and a dog, built from Kenney's "Furniture Kit" (CC0,
// https://kenney.nl) with the dog from Kenney's "Cube Pets".
//
// Furniture Kit models have their origin at the front-left corner and extend
// to the right (+x) and back (-z). One floor tile is 1×1 and 0.05 thick, and
// walls are 1.29 tall. The room spans x 0–3 and z -2–0, with walls along the
// back and left; floor and walls sit 0.05 low so the floor's top is y = 0.
// Turned pieces swing about that corner, so leave room behind them: the
// window frame stands 0.02 proud of the back wall (see ROOM_INTERIOR).
import { defineScene, type Piece } from './types'

const FURNITURE = [
  'bookcaseOpen',
  'books',
  'chairDesk',
  'computerKeyboard',
  'computerMouse',
  'computerScreen',
  'desk',
  'floorFull',
  'kitchenCoffeeMachine',
  'lampRoundFloor',
  'laptop',
  'plantSmall2',
  'pottedPlant',
  'rugRounded',
  'sideTableDrawers',
  'speakerSmall',
  'wall',
  'wallWindow'
] as const

type Model = (typeof FURNITURE)[number] | 'dog'

const FLOOR_Y = -0.05

// Where furniture may go: inside the walls, and in front of the window
// (x 1–2) clear of its frame. Checked by the unit tests against each
// model's real size.
export const ROOM_INTERIOR = {
  minX: 0,
  maxX: 3,
  minZ: -2,
  maxZ: 0,
  window: { minX: 1, maxX: 2, minZ: -1.98 }
}
export const STRUCTURE: readonly Model[] = ['floorFull', 'wall', 'wallWindow']
const DESK_TOP = 0.38

function floor(): Piece<Model>[] {
  const tiles: Piece<Model>[] = []
  for (let x = 0; x < 3; x++) {
    for (let z = 0; z > -2; z--) {
      tiles.push({ model: 'floorFull', x, z, y: FLOOR_Y })
    }
  }
  return tiles
}

export const devCorner = defineScene({
  name: 'dev-corner',
  models: {
    ...(Object.fromEntries(
      FURNITURE.map(model => [model, `/models/dev-corner/${model}.glb`])
    ) as Record<(typeof FURNITURE)[number], string>),
    dog: '/models/dev-corner/animal-dog.glb'
  },
  lightUnlitMaterials: true,
  pieces: [
    ...floor(),

    // Back wall with a window over the desk, and the left wall. The first
    // back wall piece starts 0.05 further left and is stretched to match,
    // so it fills the corner where the two walls meet.
    { model: 'wall', x: -0.05, z: -2, y: FLOOR_Y, scale: [1.05, 1, 1] },
    { model: 'wallWindow', x: 1, z: -2, y: FLOOR_Y },
    { model: 'wall', x: 2, z: -2, y: FLOOR_Y },
    { model: 'wall', x: 0, z: 0, y: FLOOR_Y, turn: 90 },
    { model: 'wall', x: 0, z: -1, y: FLOOR_Y, turn: 90 },

    // Two desks side by side under the window, a tower PC underneath.
    { model: 'desk', x: 0.75, z: -1.6 },
    { model: 'desk', x: 1.47, z: -1.6 },
    { model: 'speakerSmall', x: 1.93, z: -1.68 },

    // On the desk: two monitors, keyboard and mouse, the laptop and a small
    // plant.
    { model: 'computerScreen', x: 1.07, z: -1.86, y: DESK_TOP, turn: -8 },
    { model: 'computerScreen', x: 1.47, z: -1.8, y: DESK_TOP, turn: 8 },
    { model: 'computerKeyboard', x: 1.31, z: -1.66, y: DESK_TOP },
    { model: 'computerMouse', x: 1.69, z: -1.68, y: DESK_TOP },
    { model: 'laptop', x: 0.79, z: -1.62, y: DESK_TOP, turn: 18 },
    { model: 'plantSmall2', x: 2.09, z: -1.72, y: DESK_TOP },

    // The desk chair, pulled out a little and facing the desk. Turned half
    // way round about its corner, so x and z name its back-right corner.
    { model: 'chairDesk', x: 1.6, z: -1.5, turn: 180 },

    // Bookcase with a floor lamp beside it, back right.
    { model: 'lampRoundFloor', x: 2.28, z: -1.75 },
    { model: 'bookcaseOpen', x: 2.5, z: -1.75 },
    { model: 'books', x: 2.62, z: -1.8, y: 0.88 },

    // Coffee on a side table against the left wall, a plant in the corner.
    { model: 'sideTableDrawers', x: 0.27, z: -0.45, turn: 90 },
    { model: 'kitchenCoffeeMachine', x: 0.27, z: -0.6, y: DESK_TOP, turn: 90 },
    { model: 'pottedPlant', x: 0.2, z: -1.75 },

    // A rug in front of the desk.
    { model: 'rugRounded', x: 0.75, z: -0.1 }
  ],
  // The dog (1.6 units tall in its own pack), idling on the rug.
  actors: [
    {
      model: 'dog',
      x: 2.05,
      z: -0.55,
      turn: 25,
      scale: 0.15,
      animation: 'idle'
    }
  ],
  // From the front right, looking into the corner, about 29° above.
  camera: {
    target: [1.45, 0.6, -1.0],
    azimuth: 40,
    height: 11,
    distance: 20,
    halfWidth: 2.6
  },
  // Softer than the defaults: the furniture's colours wash out otherwise.
  lights: { ambient: 0.8, sun: 0.75 },
  // From the front right, so both walls are lit and shadows fall into the
  // corner.
  sun: { position: [5, 7, 4], shadowExtent: 3 }
})
