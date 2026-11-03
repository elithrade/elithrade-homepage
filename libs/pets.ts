// Models from Kenney's "Cube Pets" pack (CC0, https://kenney.nl), with the
// shared colour-map texture embedded so each one is a single file. Each model
// is about 2 units wide and 2.4 tall; the scene stands it on the floor.
// `x` places it along the row, left to right.
export const PETS = [
  { url: '/models/animal-cat.glb', x: -2.6 },
  { url: '/models/animal-dog.glb', x: 0 },
  { url: '/models/animal-panda.glb', x: 2.6 }
] as const
