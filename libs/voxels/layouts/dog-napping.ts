// The voxel dog napping, for the voxel-me scene. It lies at the avatar's
// feet with its head resting on its front paws and its bone beside them.
//
// Each "y N" block is one layer of voxels, from the ground (y 0) up to the
// top of the head. In a layer, each row is one step from the tail (first
// row) to the nose (last row), and each character is one voxel from the
// dog's right side to its left. A "." is empty; the other letters are
// colours, listed in PALETTE in ../layout.ts (C cream, B brown: body, eye
// patch and ears, W white, K black: eyes and nose, R red collar,
// E bone). Lower-case t and u are the tail, in brown and white: it's
// a separate part, so it can wag. Every layer must have the same size.
export const dogNapping = `
y 0
.......
.......
BBBBBBB
BBBBBBB
BBBBBBB
WBBBBBW
.RWWWR.
.WW.WW.
.WW.WW.
.WW.WWE
.WW.WWE

y 1
...u...
...t...
BBBBBBB
BBBBBBB
BBBBBBB
.BBBBB.
.RWWWR.
BCCCCCB
BCCCCCB
.CCCCC.
..WWW..

y 2
.......
.......
.......
..BBB..
..BBB..
..BBB..
.RRRRR.
BCCCCCB
BCCCCCB
.BCCCC.
..WKW..

y 3
.......
.......
.......
.......
.......
.......
.......
BCCBCCB
BCCCCCB
.BKCKC.
.......
`
