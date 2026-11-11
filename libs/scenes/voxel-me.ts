// A voxel me at my desk, on a little grass island: I stand typing at the
// keyboard, facing a monitor full of code, with a crowbar on my back, while
// the dog naps at my feet wagging its tail, a bee visits the flowers and the
// camera circles it all like a turntable. The models are built in the browser
// from the text layouts in libs/voxels/layouts/: edit a layout and the scene
// picks up the new model. One voxel is 0.1 units, except the avatar's, which
// are 0.08. It's the alternative to the voxel-dog scene, which has the dog at
// the desk instead.
import { bee, desk } from './models'
import { defineScene } from './types'

export const voxelMe = defineScene({
  name: 'voxel-me',
  label: 'Me',
  models: {
    avatar: {
      layout: 'avatar',
      // Smaller voxels than the dog's, so its hands come level with the keys.
      voxel: 0.08,
      // Each arm turns at the shoulder, so the "type" animation can tap the
      // keys.
      parts: {
        armR: { letters: 'elf', pivot: [2, 11, 3] },
        armL: { letters: 'imj', pivot: [12, 11, 3] }
      },
      animations: [{ name: 'type' }]
    },
    // Higher than in voxel-dog, so it flies over the napping dog, and not as
    // far out, so it doesn't swing wide into the dog either.
    bee: bee({ island: 'island-me', radius: 1.6, height: 0.8 }),
    desk,
    dog: {
      layout: 'dog-napping',
      // The tail turns where it meets the dog's rump, so the "wag" animation
      // swings it from side to side along the ground.
      parts: { tail: { letters: 'tu', pivot: [3.5, 1.5, 2] } },
      animations: [{ name: 'wag' }]
    },
    island: { layout: 'island-me' }
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
    // It flies round the island's flowers and over the dog, from the island's
    // centre.
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
