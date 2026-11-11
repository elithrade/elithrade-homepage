// A voxel me at my desk, on a little grass island: I stand typing at the
// keyboard, facing a monitor full of code, with a crowbar on my back, while
// the dog naps at my feet wagging its tail, a bee visits the flowers and the
// camera circles it all like a turntable. The models are built from the text
// layouts in scripts/voxels/ by scripts/make-voxel-models.mjs: edit a layout,
// rerun the script, and the scene picks up the new model. One voxel is 0.1
// units, except the avatar's, which are 0.08. It's the alternative to the
// voxel-dog scene, which has the dog at the desk instead.
import { defineScene } from './types'

export const voxelMe = defineScene({
  name: 'voxel-me',
  label: 'Me',
  models: {
    avatar: '/models/voxel-me/avatar.glb',
    bee: '/models/voxel-me/bee.glb',
    desk: '/models/voxel-me/desk.glb',
    dog: '/models/voxel-me/dog.glb',
    island: '/models/voxel-me/island.glb'
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
  // Starts in front of the avatar and to one side, so its face shows over the
  // monitor; the turntable brings the code on the screen round a few seconds
  // later. The view is just wide enough to keep the island and the crowbar's
  // hook inside the canvas all the way round.
  camera: {
    target: [0, 0.54, 0],
    azimuth: 125,
    height: 11,
    distance: 20,
    halfWidth: 2.75,
    turntable: 30
  },
  // From behind the starting view, so it lights the avatar's face.
  sun: { position: [5, 7, -3], shadowExtent: 2 }
})
