// A voxel me at my desk, on a little grass island: I stand typing at the
// keyboard, facing a monitor full of code, with a crowbar on my back, while
// the dog naps at my feet wagging its tail, a bee visits the flowers and the
// camera circles it all like a turntable. The models are built from the text
// layouts in scripts/voxels/ by scripts/make-voxel-models.mjs: edit a layout,
// rerun the script, and the scene picks up the new model. One voxel is 0.1
// units, except the avatar's, which are 0.08.
import { defineScene } from './types'

export const voxelDog = defineScene({
  name: 'voxel-dog',
  models: {
    avatar: '/models/voxel-dog/avatar.glb',
    bee: '/models/voxel-dog/bee.glb',
    desk: '/models/voxel-dog/desk.glb',
    dog: '/models/voxel-dog/dog.glb',
    island: '/models/voxel-dog/island.glb'
  },
  pieces: [
    { model: 'island', x: 0, z: 0 },
    // Screen facing forward, at the back of a deep desk.
    { model: 'desk', x: 0, z: -0.425 }
  ],
  actors: [
    // Turned round to face the screen, close enough that the hands rest on
    // the keyboard at the front of the desk. The crowbar on its back makes
    // the model a voxel wider on one side, so it's nudged across to centre
    // the body on the keyboard.
    { model: 'avatar', x: 0.04, z: 0.19, turn: 180, animation: 'type' },
    // Lying just behind the avatar's heels, facing out.
    { model: 'dog', x: 0, z: 0.92, animation: 'wag' },
    // Its flight path, round the island's flowers and over the dog, is baked
    // into the model.
    { model: 'bee', x: 0, z: 0, animation: 'fly' }
  ],
  // Starts side on, so the code shows beside the avatar.
  camera: {
    target: [0, 0.6, 0],
    azimuth: 65,
    height: 11,
    distance: 20,
    halfWidth: 2.4,
    turntable: 30
  },
  // From the right and a little behind, so it lights the avatar's face as
  // well as the side seen at the start.
  sun: { position: [5, 7, -3], shadowExtent: 2 }
})
