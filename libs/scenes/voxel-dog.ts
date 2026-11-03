// A voxel dog at its desk, on a little grass island: it stands on its hind
// legs with its front paws on the keyboard, facing a monitor full of code and
// wagging its tail while the camera circles it like a turntable. The models are built from the text layouts in scripts/voxels/
// by scripts/make-voxel-models.mjs: edit a layout, rerun the script, and the
// scene picks up the new model. One voxel is 0.1 units.
import { defineScene } from './types'

export const voxelDog = defineScene({
  name: 'voxel-dog',
  models: {
    desk: '/models/voxel-dog/desk.glb',
    dog: '/models/voxel-dog/dog.glb',
    island: '/models/voxel-dog/island.glb'
  },
  pieces: [
    { model: 'island', x: 0, z: 0 },
    // At the back of the island, screen facing forward.
    { model: 'desk', x: 0, z: -0.75 }
  ],
  // Turned round to face the screen, close enough that its front paws rest
  // on the keyboard.
  actors: [{ model: 'dog', x: 0, z: -0.1, turn: 180, animation: 'wag' }],
  camera: {
    target: [0, 0.72, 0],
    azimuth: 50,
    height: 11,
    distance: 20,
    halfWidth: 2.75,
    turntable: 30
  },
  sun: { position: [4, 7, 5], shadowExtent: 2 }
})
