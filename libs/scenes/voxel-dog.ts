// A voxel dog on a little grass island, turning slowly like a turntable.
// Both models are built from the text layouts in scripts/voxels/ by
// scripts/make-voxel-models.mjs: edit a layout, rerun the script, and the
// scene picks up the new model.
import { defineScene } from './types'

export const voxelDog = defineScene({
  name: 'voxel-dog',
  models: {
    dog: '/models/voxel-dog/dog.glb',
    island: '/models/voxel-dog/island.glb'
  },
  pieces: [{ model: 'island', x: 0, z: 0 }],
  // Standing in the middle of the island, wagging its tail.
  actors: [{ model: 'dog', x: 0, z: 0, animation: 'wag' }],
  camera: {
    target: [0, 0.46, 0],
    azimuth: 30,
    height: 11,
    distance: 20,
    halfWidth: 1.9,
    turntable: 30
  },
  sun: { position: [4, 7, 5], shadowExtent: 1.5 }
})
