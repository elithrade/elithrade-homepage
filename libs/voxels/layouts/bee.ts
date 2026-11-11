// The bee that flies between the island's flowers. Its voxels are smaller
// than the dog's (see `bee` in libs/scenes/models.ts).
//
// Same format as dog.ts: one "y N" block per layer from the bottom up, rows
// from the stinger (first row) to the head (last row). U yellow and K black
// stripes, W eyes; the wings q and r are separate parts, so they can flap.
export const bee = `
y 0
.....
..K..
.UUU.
.KKK.
.UUU.
.KKK.
.KKK.

y 1
.....
..K..
.UUU.
.KKK.
.UUU.
.KKK.
.WKW.

y 2
.....
.....
.UUU.
.KKK.
.UUU.
.KKK.
.KKK.

y 3
.....
.....
.....
qq.rr
qq.rr
.....
.K.K.
`
