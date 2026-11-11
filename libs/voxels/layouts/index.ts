import { avatar } from './avatar'
import { bee } from './bee'
import { desk } from './desk'
import { dog } from './dog'
import { dogNapping } from './dog-napping'
import { island } from './island'
import { islandMe } from './island-me'

// Every model's voxels, drawn as text: see the top of each file for how to
// read one. Scenes refer to a layout by its name here.
export const LAYOUTS = {
  avatar,
  bee,
  desk,
  dog,
  'dog-napping': dogNapping,
  island,
  'island-me': islandMe
}

export type LayoutName = keyof typeof LAYOUTS
