import { voxelDog } from './voxel-dog'
import { voxelMe } from './voxel-me'

// The scenes visitors can switch between at the top of every page, in the
// order of the switch's buttons.
export const SCENES = [voxelDog, voxelMe]

// The scene shown until a visitor picks another.
export const HERO_SCENE = voxelDog
