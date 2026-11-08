// A voxel dog at its desk, on a little grass island: it stands on its hind
// legs with its front paws on the keyboard, facing a monitor full of code and
// wagging its tail, while a bee visits the flowers and the camera circles it
// all like a turntable. The models are built from the text layouts in
// scripts/voxels/ by scripts/make-voxel-models.mjs: edit a layout, rerun the
// script, and the scene picks up the new model. One voxel is 0.1 units.
import { defineScene } from './types'

export const voxelDog = defineScene({
  name: 'voxel-dog',
  label: 'Dog',
  models: {
    bee: '/models/voxel-dog/bee.glb',
    desk: '/models/voxel-dog/desk.glb',
    dog: '/models/voxel-dog/dog.glb',
    island: '/models/voxel-dog/island.glb'
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
    // Its flight path, round the island's flowers, is baked into the model.
    { model: 'bee', x: 0, z: 0, animation: 'fly' }
  ],
  // Starts side on, so the code shows beside the dog. The monitor sits low
  // enough that the dog's face shows over it from the front.
  camera: {
    target: [0, 0.52, 0],
    azimuth: 65,
    height: 11,
    distance: 20,
    halfWidth: 2.4,
    turntable: 30
  },
  // From the right and a little behind, so it lights the dog's face as well
  // as the side seen at the start.
  sun: { position: [5, 7, -3], shadowExtent: 2 }
})
