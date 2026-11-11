// A voxel dog at its desk, on a little grass island: it stands on its hind
// legs with its front paws on the keyboard, facing a monitor full of code and
// wagging its tail, while a bee visits the flowers and the camera circles it
// all like a turntable. The models are built in the browser from the text
// layouts in libs/voxels/layouts/: edit a layout and the scene picks up the
// new model. One voxel is 0.1 units.
import { bee, desk } from './models'
import { defineScene } from './types'

export const voxelDog = defineScene({
  name: 'voxel-dog',
  label: 'Dog',
  models: {
    // Out just past the island's edge between flowers, so it loops round the
    // desk instead of cutting between its legs.
    bee: bee({ island: 'island', radius: 1.9, height: 0.5 }),
    desk,
    dog: {
      layout: 'dog',
      // The tail is its own part, turning where it meets the dog's back, so
      // the "wag" animation can swing it side to side.
      parts: { tail: { letters: 'tu', pivot: [4.5, 4.5, 2] } },
      animations: [{ name: 'wag' }]
    },
    island: { layout: 'island' }
  },
  pieces: [
    { model: 'island', x: 0, z: 0 },
    // Screen facing forward, at the back of a deep desk so there's room
    // between it and the dog's face. Desk and dog together are centred on
    // the island.
    { model: 'desk', x: 0, z: -0.425 }
  ],
  actors: [
    // Turned round to face the screen, close enough that its front paws rest
    // on the keyboard at the front of the desk.
    { model: 'dog', x: 0, z: 0.375, turn: 180, animation: 'wag' },
    // It flies round the island's flowers, from the island's centre.
    { model: 'bee', x: 0, z: 0, animation: 'fly' }
  ],
  // Starts in front of the dog and to one side: the monitor sits low enough
  // that its face shows over it. The turntable brings the code on the screen
  // round a few seconds later. As wide a view as voxel-me's, so the island
  // stays the same size when switching between them.
  camera: {
    target: [0, 0.46, 0],
    azimuth: 125,
    height: 11,
    distance: 20,
    halfWidth: 2.75,
    turntable: 30
  },
  // From behind the starting view, so it lights the dog's face.
  sun: { position: [5, 7, -3], shadowExtent: 2 }
})
