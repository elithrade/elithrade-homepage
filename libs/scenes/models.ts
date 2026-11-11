// Models that more than one scene uses.
import type { FlyDef, ModelDef } from '../voxels/types'

// The screen is unlit, so it glows instead of being shaded.
export const desk: ModelDef = {
  layout: 'desk',
  parts: { screen: { letters: 'SXYZV', unlit: true } }
}

// Each wing turns about the line along the top of the bee's back. Its flight
// path is worked out from the flowers on the island it flies round.
export const bee = (flight: Omit<FlyDef, 'name'>): ModelDef => ({
  layout: 'bee',
  voxel: 0.03,
  parts: {
    wingL: { letters: 'q', pivot: [2.5, 3, 4] },
    wingR: { letters: 'r', pivot: [2.5, 3, 4] }
  },
  animations: [{ name: 'fly', ...flight }]
})
