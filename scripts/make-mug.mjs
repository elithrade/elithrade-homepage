// Builds the coffee mug for the dev corner (public/models/dev-corner/mug.glb).
// Kenney's Furniture Kit has no mug, so this makes one in its style: low
// poly, flat unlit colours, origin at the front-left corner, extending to the
// right (+x) and back (-z). One unit is one floor tile.
//
//   node scripts/make-mug.mjs
import { writeFileSync } from 'node:fs'
import * as THREE from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'

// GLTFExporter reads its output through the browser's FileReader.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buffer => {
      this.result = buffer
      this.onloadend?.()
    })
  }
}

const RADIUS = 0.028
const HEIGHT = 0.062
const WALL = 0.004
const SIDES = 12

// Flat shaded, like the rest of the kit.
function faceted(geometry) {
  const flat = geometry.toNonIndexed()
  flat.computeVertexNormals()
  return flat
}

const unlit = color => new THREE.MeshBasicMaterial({ color })
const glaze = unlit(0xd9643a)
const coffee = unlit(0x4a2c1d)

// The cup: a profile turned about y, out along the base, up the outside,
// over the rim and down the inside.
const cup = new THREE.Mesh(
  faceted(
    new THREE.LatheGeometry(
      [
        [0, 0],
        [RADIUS, 0],
        [RADIUS, HEIGHT],
        [RADIUS - WALL, HEIGHT],
        [RADIUS - WALL, WALL],
        [0, WALL]
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      SIDES
    )
  ),
  glaze
)
cup.name = 'cup'

const surface = new THREE.Mesh(
  faceted(new THREE.CircleGeometry(RADIUS - WALL, SIDES).rotateX(-Math.PI / 2)),
  coffee
)
surface.name = 'coffee'
surface.position.y = HEIGHT - 0.012

// Half a ring standing up on the right-hand side.
const handle = new THREE.Mesh(
  faceted(
    new THREE.TorusGeometry(0.016, 0.005, 6, 8, Math.PI).rotateZ(-Math.PI / 2)
  ),
  glaze
)
handle.name = 'handle'
handle.position.set(RADIUS - 0.002, HEIGHT / 2, 0)

const mug = new THREE.Group()
mug.name = 'mug'
mug.add(cup, surface, handle)

// Move the front-left corner of its footprint to the origin.
const box = new THREE.Box3().setFromObject(mug)
for (const part of mug.children) {
  part.position.x -= box.min.x
  part.position.z -= box.max.z
}

const scene = new THREE.Scene()
scene.add(mug)
const glb = await new GLTFExporter().parseAsync(scene, { binary: true })
const out = new URL('../public/models/dev-corner/mug.glb', import.meta.url)
writeFileSync(out, Buffer.from(glb))
console.log(`wrote ${out.pathname} (${glb.byteLength} bytes)`)
