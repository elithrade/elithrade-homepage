// The movements voxel models can loop, as three.js animation clips. A track
// named "part.property" moves that part of the model; one named ".property"
// moves the whole model.
import * as THREE from 'three'
import { VOXEL, readVoxels } from './layout'
import type { ClipDef, FlyDef } from './types'

// Swings the tail 25° either way about the vertical, twice a second.
function wag() {
  const axis = new THREE.Vector3(0, 1, 0)
  const turn = (degrees: number) =>
    new THREE.Quaternion().setFromAxisAngle(axis, (degrees * Math.PI) / 180)
  const keys = [0, 25, 0, -25, 0].map(turn)
  return new THREE.AnimationClip('wag', 0.5, [
    new THREE.QuaternionKeyframeTrack(
      'tail.quaternion',
      [0, 0.125, 0.25, 0.375, 0.5],
      keys.flatMap(q => q.toArray())
    )
  ])
}

// Taps the keys: each arm lifts its hand a little and drops it again, in
// turn, about three times a second.
function type() {
  const axis = new THREE.Vector3(1, 0, 0)
  const lift = (degrees: number) =>
    new THREE.Quaternion()
      .setFromAxisAngle(axis, (-degrees * Math.PI) / 180)
      .toArray()
  const times = [0, 0.15, 0.3, 0.45, 0.6]
  const track = (part: string, keys: number[]) =>
    new THREE.QuaternionKeyframeTrack(
      `${part}.quaternion`,
      times,
      keys.flatMap(lift)
    )
  return new THREE.AnimationClip('type', 0.6, [
    track('armR', [0, 7, 0, 0, 0]),
    track('armL', [0, 0, 0, 7, 0])
  ])
}

// Flies a loop round the island: out to `radius` from its centre at
// `height`, then in to hover over each flower in the island's layout in
// turn, bobbing and flapping all the way. The path follows the flowers, so
// it changes when they're moved.
function fly({ island: layout, radius, height }: FlyDef) {
  const SPEED = 0.6 // units per second
  const HOVER = 0.8 // seconds over each flower

  const island = readVoxels(layout)
  const flowers = island.voxels
    .filter(v => 'FO'.includes(v.letter))
    .map(v => ({
      x: (v.x + 0.5 - island.width / 2) * VOXEL,
      z: (v.z + 0.5 - island.depth / 2) * VOXEL,
      top: (v.y + 1) * VOXEL,
      angle: Math.atan2(
        v.z + 0.5 - island.depth / 2,
        v.x + 0.5 - island.width / 2
      )
    }))
    .sort((a, b) => a.angle - b.angle)

  // Two points just above each flower (the hover), then one out at the
  // edge halfway round to the next flower.
  const points: THREE.Vector3[] = []
  const durations: number[] = []
  flowers.forEach((flower, i) => {
    const next = flowers[(i + 1) % flowers.length]
    const gap = (next.angle - flower.angle + 2 * Math.PI) % (2 * Math.PI)
    const out = flower.angle + gap / 2
    points.push(
      new THREE.Vector3(flower.x, flower.top + 0.1, flower.z),
      new THREE.Vector3(flower.x, flower.top + 0.14, flower.z),
      new THREE.Vector3(radius * Math.cos(out), height, radius * Math.sin(out))
    )
  })
  for (let i = 0; i < points.length; i++) {
    const distance = points[i].distanceTo(points[(i + 1) % points.length])
    durations.push(i % 3 === 0 ? HOVER : distance / SPEED)
  }

  const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal')
  const times: number[] = []
  const positions: number[] = []
  const turns: number[] = []
  const up = new THREE.Vector3(0, 1, 0)
  let time = 0
  let heading = 0
  for (let i = 0; i <= points.length; i++) {
    const steps =
      i < points.length ? Math.max(4, Math.ceil(durations[i] / 0.1)) : 1
    for (let step = 0; step < steps; step++) {
      const t = ((i + step / steps) / points.length) % 1
      const point = curve.getPoint(t)
      // Face the way it's flying, but keep its heading while it hovers.
      const tangent = curve.getTangent(t)
      if (Math.hypot(tangent.x, tangent.z) > 0.2) {
        heading = Math.atan2(tangent.x, tangent.z)
      }
      times.push(time)
      positions.push(
        point.x,
        point.y + 0.012 * Math.sin(time * 2 * Math.PI * 3),
        point.z
      )
      turns.push(
        ...new THREE.Quaternion().setFromAxisAngle(up, heading).toArray()
      )
      if (i === points.length) break
      time += durations[i] / steps
    }
  }

  // Wings beat about twelve times a second, both up together.
  const beats = Math.round(time * 12)
  const forward = new THREE.Vector3(0, 0, 1)
  const wingTimes: number[] = []
  const left: number[] = []
  const right: number[] = []
  for (let i = 0; i <= beats * 2; i++) {
    const angle = ((i % 2 === 0 ? 40 : -10) * Math.PI) / 180
    wingTimes.push((i * time) / (beats * 2))
    left.push(
      ...new THREE.Quaternion().setFromAxisAngle(forward, -angle).toArray()
    )
    right.push(
      ...new THREE.Quaternion().setFromAxisAngle(forward, angle).toArray()
    )
  }

  return new THREE.AnimationClip('fly', time, [
    new THREE.VectorKeyframeTrack('.position', times, positions),
    new THREE.QuaternionKeyframeTrack('.quaternion', times, turns),
    new THREE.QuaternionKeyframeTrack('wingL.quaternion', wingTimes, left),
    new THREE.QuaternionKeyframeTrack('wingR.quaternion', wingTimes, right)
  ])
}

export function buildClip(def: ClipDef) {
  switch (def.name) {
    case 'wag':
      return wag()
    case 'type':
      return type()
    case 'fly':
      return fly(def)
  }
}
